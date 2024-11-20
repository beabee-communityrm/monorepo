import {
  CalloutFilterName,
  calloutFilters,
  Filters,
  ItemStatus,
  PaginatedQuery,
  Rule,
  RuleGroup
} from "@beabee/beabee-common";
import { TransformPlainToInstance } from "class-transformer";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} from "routing-controllers";
import { SelectQueryBuilder } from "typeorm";

import { createQueryBuilder, getRepository } from "@beabee/core/database";

import {
  GetCalloutWith,
  ListCalloutsDto,
  GetCalloutDto,
  GetCalloutOptsDto
} from "@api/dto/CalloutDto";
import { BaseTransformer } from "@api/transformers/BaseTransformer";
import CalloutVariantTransformer from "@api/transformers/CalloutVariantTransformer";
import { groupBy } from "@api/utils";
import { mergeRules, statusFilterHandler } from "@api/utils/rules";

import {
  Callout,
  CalloutResponse,
  CalloutReviewer,
  CalloutVariant
} from "@beabee/core/models";

import { AuthInfo } from "@type/auth-info";
import { FilterHandlers } from "@type/filter-handlers";
import { getReviewerRules } from "./BaseCalloutResponseTransformer";

class CalloutTransformer extends BaseTransformer<
  Callout,
  GetCalloutDto,
  CalloutFilterName,
  GetCalloutOptsDto
> {
  protected model = Callout;
  protected modelIdField = "id";
  protected filters = calloutFilters;
  protected filterHandlers: FilterHandlers<CalloutFilterName> = {
    status: statusFilterHandler,
    title: (qb, args) => {
      // Filter by variant title
      qb.where(args.convertToWhereClause("cvd.title"));
    }
  };

  protected async transformFilters(
    query: GetCalloutOptsDto & PaginatedQuery,
    auth: AuthInfo | undefined
  ): Promise<
    [Partial<Filters<CalloutFilterName>>, FilterHandlers<CalloutFilterName>]
  > {
    return [
      {},
      {
        answeredBy: (qb, args) => {
          // TODO: support not_equal for admins
          if (args.operator !== "equal") {
            throw new BadRequestError("answeredBy only supports equal");
          }

          // Non-admins can only query for their own responses
          if (
            auth?.contact &&
            !auth.roles.includes("admin") &&
            args.value[0] !== auth.contact.id
          ) {
            throw new UnauthorizedError();
          }

          // TODO: deduplicate with hasAnswered
          const subQb = createQueryBuilder()
            .subQuery()
            .select("cr.calloutId")
            .distinctOn(["cr.calloutId"])
            .from(CalloutResponse, "cr")
            .where(args.convertToWhereClause(`cr.contactId`))
            .orderBy("cr.calloutId");

          qb.where(`${args.fieldPrefix}id IN ${subQb.getQuery()}`);
        }
      }
    ];
  }

  @TransformPlainToInstance(GetCalloutDto)
  convert(callout: Callout, opts?: GetCalloutOptsDto): GetCalloutDto {
    const variants = Object.fromEntries(
      callout.variants.map((variant) => [
        variant.name,
        CalloutVariantTransformer.convert(variant)
      ])
    );

    const variant = variants[opts?.variant || "default"];
    if (!variant) {
      throw new NotFoundError(`Variant ${opts?.variant} not found`);
    }

    // Merge variant texts into form schema
    const formSchema = {
      slides: callout.formSchema.slides.map((slide) => ({
        ...slide,
        navigation: {
          ...variant.slideNavigation[slide.id],
          ...slide.navigation
        }
      })),
      componentText: variant.componentText
    };

    return {
      id: callout.id,
      slug: callout.slug,
      title: variant.title,
      excerpt: variant.excerpt,
      image: callout.image,
      allowUpdate: callout.allowUpdate,
      allowMultiple: callout.allowMultiple,
      access: callout.access,
      captcha: callout.captcha,
      status: callout.status,
      hidden: callout.hidden,
      starts: callout.starts,
      expires: callout.expires,
      channels: callout.channels,
      ...(callout.hasAnswered !== undefined && {
        hasAnswered: callout.hasAnswered
      }),
      ...(callout.responseCount !== undefined && {
        responseCount: callout.responseCount
      }),
      ...(opts?.with?.includes(GetCalloutWith.Form) && {
        intro: variant.intro,
        thanksText: variant.thanksText,
        thanksTitle: variant.thanksTitle,
        formSchema,
        ...(variant.thanksRedirect && {
          thanksRedirect: variant.thanksRedirect
        }),
        ...(variant.shareTitle && { shareTitle: variant.shareTitle }),
        ...(variant.shareDescription && {
          shareDescription: variant.shareDescription
        })
      }),
      ...(opts?.with?.includes(GetCalloutWith.ResponseViewSchema) && {
        responseViewSchema: callout.responseViewSchema
      }),
      ...(opts?.with?.includes(GetCalloutWith.VariantNames) && {
        variantNames: callout.variantNames
      }),
      ...(opts?.with?.includes(GetCalloutWith.Variants) && {
        variants
      })
    };
  }

  protected async transformQuery<T extends ListCalloutsDto>(
    query: T,
    auth: AuthInfo | undefined
  ): Promise<T> {
    const authRules = await getAuthRules(auth, query.showHiddenForAll);

    if (auth?.roles.includes("admin")) {
      return query;
    }

    // Non-admins can't see response counts
    if (query.with?.includes(GetCalloutWith.ResponseCount)) {
      throw new UnauthorizedError();
    }

    return {
      ...query,
      // Non-admins can only query for open or ended non-hidden callouts
      rules: mergeRules([
        query.rules,
        {
          condition: "OR",
          rules: [
            {
              field: "status",
              operator: "equal",
              value: [ItemStatus.Open]
            },
            {
              field: "status",
              operator: "equal",
              value: [ItemStatus.Ended]
            }
          ]
        },
        !query.showHiddenForAll && {
          field: "hidden",
          operator: "equal",
          value: [false]
        }
      ])
    };
  }

  protected modifyQueryBuilder(
    qb: SelectQueryBuilder<Callout>,
    fieldPrefix: string,
    query: ListCalloutsDto
  ): void {
    if (query.with?.includes(GetCalloutWith.ResponseCount)) {
      qb.loadRelationCountAndMap(
        `${fieldPrefix}responseCount`,
        `${fieldPrefix}responses`
      );
    }

    // Always load a variant for filtering and sorting
    qb.leftJoinAndSelect(`${fieldPrefix}variants`, "cvd", "cvd.name = :name", {
      name: query.variant || "default"
    });

    if (query.sort === "title") {
      qb.orderBy("cvd.title", query.order || "ASC");
    }
  }

  protected async modifyItems(
    callouts: Callout[],
    query: ListCalloutsDto,
    auth: AuthInfo | undefined
  ): Promise<void> {
    if (callouts.length > 0) {
      const calloutIds = callouts.map((c) => c.id);

      const withVariants = query.with?.includes(GetCalloutWith.Variants);
      const withVariantNames = query.with?.includes(
        GetCalloutWith.VariantNames
      );
      if (withVariants || withVariantNames) {
        const qb = createQueryBuilder(CalloutVariant, "cv").where(
          "cv.calloutId IN (:...ids)",
          { ids: calloutIds }
        );

        // Fetch minimal data if not requesting the variants
        if (!query.with?.includes(GetCalloutWith.Variants)) {
          qb.select(["cv.name", "cv.calloutId"]);
        }

        const variants = await qb.getMany();

        const variantsById = groupBy(variants, (v) => v.calloutId);

        for (const callout of callouts) {
          const calloutVariants = variantsById[callout.id] || [];
          if (withVariantNames) {
            callout.variantNames = calloutVariants.map((v) => v.name);
          }
          if (withVariants) {
            callout.variants = calloutVariants;
          }
        }
      }

      if (auth?.contact && query.with?.includes(GetCalloutWith.HasAnswered)) {
        const answeredCallouts = await createQueryBuilder(CalloutResponse, "cr")
          .select("cr.calloutId", "id")
          .distinctOn(["cr.calloutId"])
          .where("cr.calloutId IN (:...ids) AND cr.contactId = :id", {
            ids: calloutIds,
            id: auth.contact.id
          })
          .orderBy("cr.calloutId")
          .getRawMany<{ id: string }>();

        const answeredIds = answeredCallouts.map((c) => c.id);

        for (const callout of callouts) {
          callout.hasAnswered = answeredIds.includes(callout.id);
        }
      }
    }
  }
}

/**
 * Get the rules for filtering callouts based on the user's role
 *
 * @param auth The authentication info
 * @param showHiddenForAll Whether to show hidden callouts to non-admins
 * @returns
 */
async function getAuthRules(
  auth: AuthInfo | undefined,
  showHiddenForAll: boolean
): Promise<RuleGroup | undefined> {
  // Admins can see all callouts, no restrictions needed
  if (auth?.roles.includes("admin")) {
    return;
  }

  let reviewerRules =
    auth?.method === "user" ? await getReviewerRules(auth.contact, "id") : [];

  return {
    condition: "OR",
    rules: [
      // Reviewers can see all the callouts they are reviewers for
      ...reviewerRules,

      // Non-admins can only see open or ended non-hidden callouts
      mergeRules([
        {
          condition: "OR",
          rules: [
            {
              field: "status",
              operator: "equal",
              value: [ItemStatus.Open]
            },
            {
              field: "status",
              operator: "equal",
              value: [ItemStatus.Ended]
            }
          ]
        },
        !showHiddenForAll && {
          field: "hidden",
          operator: "equal",
          value: [true]
        }
      ])
    ]
  };
}

export default new CalloutTransformer();
