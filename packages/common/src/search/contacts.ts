import type { AssertFilters, Filters } from "../types/index.ts";
import {
  ContributionPeriod,
  ContributionType,
  NewsletterStatus,
} from "../data/index.ts";

export const RoleTypes = ["member", "admin", "superadmin"] as const;

type ContactFilters = {
  readonly id: {
    readonly type: "contact";
  };
  readonly firstname: {
    readonly type: "text";
  };
  readonly lastname: {
    readonly type: "text";
  };
  readonly email: {
    readonly type: "text";
  };
  readonly joined: {
    readonly type: "date";
  };
  readonly lastSeen: {
    readonly type: "date";
  };
  readonly contributionCancelled: {
    readonly type: "date";
    readonly nullable: true;
  };
  readonly contributionType: {
    readonly type: "enum";
    readonly options: [
      ContributionType.Automatic,
      ContributionType.Gift,
      ContributionType.Manual,
      ContributionType.None,
    ];
  };
  readonly contributionMonthlyAmount: {
    readonly type: "number";
  };
  readonly contributionPeriod: {
    readonly type: "enum";
    readonly options: [ContributionPeriod.Monthly, ContributionPeriod.Annually];
  };
  readonly deliveryOptIn: {
    readonly type: "boolean";
  };
  readonly newsletterStatus: {
    readonly type: "enum";
    readonly options: [
      NewsletterStatus.Subscribed,
      NewsletterStatus.Unsubscribed,
      NewsletterStatus.Cleaned,
      NewsletterStatus.Pending,
      NewsletterStatus.None,
    ];
  };
  readonly newsletterGroups: {
    readonly type: "array";
  };
  readonly activePermission: {
    readonly type: "enum";
    readonly options: typeof RoleTypes;
  };
  readonly activeMembership: {
    readonly type: "boolean";
  };
  readonly membershipStarts: {
    readonly type: "date";
  };
  readonly membershipExpires: {
    readonly type: "date";
  };
  readonly manualPaymentSource: {
    readonly type: "text";
    readonly nullable: true;
  };
  readonly tags: {
    readonly type: "array";
  };
};

export const contactFilters: AssertFilters<ContactFilters> = {
  id: {
    type: "contact",
  },
  firstname: {
    type: "text",
  },
  lastname: {
    type: "text",
  },
  email: {
    type: "text",
  },
  joined: {
    type: "date",
  },
  lastSeen: {
    type: "date",
  },
  contributionCancelled: {
    type: "date",
    nullable: true,
  },
  contributionType: {
    type: "enum",
    options: [
      ContributionType.Automatic,
      ContributionType.Gift,
      ContributionType.Manual,
      ContributionType.None,
    ] as const satisfies ContributionType[],
  },
  contributionMonthlyAmount: {
    type: "number",
  },
  contributionPeriod: {
    type: "enum",
    options: [
      ContributionPeriod.Monthly,
      ContributionPeriod.Annually,
    ] as const satisfies ContributionPeriod[],
  },
  deliveryOptIn: {
    type: "boolean",
  },
  newsletterStatus: {
    type: "enum",
    options: [
      NewsletterStatus.Subscribed,
      NewsletterStatus.Unsubscribed,
      NewsletterStatus.Cleaned,
      NewsletterStatus.Pending,
      NewsletterStatus.None,
    ] as const satisfies NewsletterStatus[],
  },
  newsletterGroups: {
    type: "array",
  },
  activePermission: {
    type: "enum",
    options: RoleTypes,
  },
  activeMembership: {
    type: "boolean",
  },
  membershipStarts: {
    type: "date",
  },
  membershipExpires: {
    type: "date",
  },
  manualPaymentSource: {
    type: "text",
    nullable: true,
  },
  tags: {
    type: "array",
  },
} as const satisfies Filters;

export type ContactFilterName = keyof typeof contactFilters;

type ContactCalloutFilters = {
  readonly hasAnswered: {
    readonly type: "boolean";
  };
};

export const contactCalloutFilters: AssertFilters<ContactCalloutFilters> = {
  hasAnswered: {
    type: "boolean",
  },
} as const satisfies Filters;

export type ContactCalloutFilterName = keyof typeof contactCalloutFilters;
