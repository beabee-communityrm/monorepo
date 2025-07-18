import {
  CalloutComponentBaseInputSchema,
  CalloutComponentBaseInputSelectableSchema,
  CalloutComponentBaseNestableSchema,
  CalloutComponentBaseRules,
  CalloutComponentBaseSchema,
  CalloutComponentBaseType,
  CalloutComponentContentSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentSchema,
  CalloutComponentType,
  CalloutResponseAnswer,
  GetCalloutFormSchema,
  GetCalloutNavigationSchema,
  GetCalloutSlideSchema,
  SetCalloutFormSchema,
  SetCalloutNavigationSchema,
  SetCalloutSlideSchema,
  calloutComponentInputSelectableTypes,
  calloutComponentInputTypes,
  calloutComponentNestableTypes,
  isCalloutComponentOfBaseType,
} from '@beabee/beabee-common';
import { log as mainLogger } from '@beabee/core/logging';

import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  ValidateBy,
  ValidateNested,
  ValidationOptions,
  buildMessage,
  validate,
} from 'class-validator';

const log = mainLogger.child({ app: 'callout-form-validation' });

abstract class CalloutComponentBaseDto implements CalloutComponentBaseSchema {
  abstract type: CalloutComponentType;
  abstract input?: boolean;

  @IsString()
  id!: string;

  @IsString()
  key!: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsBoolean()
  adminOnly?: boolean;

  // Unused properties
  [key: string]: unknown;
}

class CalloutComponentContentDto
  extends CalloutComponentBaseDto
  implements CalloutComponentContentSchema
{
  @Equals(false)
  input!: false;

  @Equals(CalloutComponentType.CONTENT)
  type!: CalloutComponentType.CONTENT;

  @IsString()
  html!: string;

  @IsString()
  label!: string;

  @IsOptional()
  @IsObject()
  validate?: CalloutComponentBaseRules;

  @IsOptional()
  @IsBoolean()
  multiple?: boolean;

  @IsOptional()
  defaultValue?: CalloutResponseAnswer | CalloutResponseAnswer[] | null;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}

class CalloutComponentInputDto
  extends CalloutComponentBaseDto
  implements CalloutComponentBaseInputSchema
{
  @IsIn(calloutComponentInputTypes)
  type!: CalloutComponentBaseInputSchema['type'];

  @Equals(true)
  input!: true;
}

class CalloutComponentInputSelectDataValueDto {
  @IsString()
  label!: string;

  @IsString()
  value!: string;
}

class CalloutComponentInputSelectDataDto {
  @ValidateNested({ each: true })
  @Type(() => CalloutComponentInputSelectDataValueDto)
  values!: CalloutComponentInputSelectDataValueDto[];

  // Unused properties
  [key: string]: unknown;
}

class CalloutComponentInputSelectDto
  extends CalloutComponentInputDto
  implements CalloutComponentInputSelectSchema
{
  @Equals(CalloutComponentType.INPUT_SELECT)
  type!: CalloutComponentType.INPUT_SELECT;

  @ValidateNested()
  @Type(() => CalloutComponentInputSelectDataDto)
  data!: CalloutComponentInputSelectDataDto;
}

class CalloutComponentInputSelectableValueDto {
  @IsString()
  label!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  nextSlideId?: string;
}

class CalloutComponentInputSelectableDto
  extends CalloutComponentInputDto
  implements CalloutComponentBaseInputSelectableSchema
{
  @IsIn(calloutComponentInputSelectableTypes)
  type!: CalloutComponentBaseInputSelectableSchema['type'];

  @ValidateNested({ each: true })
  @Type(() => CalloutComponentInputSelectableValueDto)
  values!: CalloutComponentInputSelectableValueDto[];
}

function ComponentType() {
  return Transform(({ value }) => {
    if (!Array.isArray(value)) throw new Error('Components must be an array');

    return value.map((component) => {
      if (typeof component !== 'object' || component === null)
        throw new Error('Component must be an object');

      switch (component.type) {
        case CalloutComponentType.CONTENT:
          return plainToInstance(CalloutComponentContentDto, component);
        case CalloutComponentType.INPUT_SELECT:
          return plainToInstance(CalloutComponentInputSelectDto, component);
      }

      if (
        isCalloutComponentOfBaseType(
          component,
          CalloutComponentBaseType.INPUT_SELECTABLE
        )
      ) {
        return plainToInstance(CalloutComponentInputSelectableDto, component);
      }
      if (
        isCalloutComponentOfBaseType(component, CalloutComponentBaseType.INPUT)
      ) {
        return plainToInstance(CalloutComponentInputDto, component);
      }
      if (
        isCalloutComponentOfBaseType(
          component,
          CalloutComponentBaseType.NESTABLE
        )
      ) {
        return plainToInstance(CalloutComponentNestableDto, component);
      }

      throw new Error('Unknown component type ' + component.type);
    });
  });
}

// This is hack to disable whitelist validation for components because
// the schema for a component has loads of properties and it would take
// a long time to list them all.
// TODO: validate properly!
function IsComponent(validationOptions?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isComponent',
      validator: {
        async validate(value: unknown) {
          if (typeof value !== 'object' || value === null) return false;
          const errors = await validate(value, {
            whitelist: false,
            forbidUnknownValues: true,
          });
          if (errors.length > 0) {
            log.notice('Component validation errors', { errors });
          }
          return errors.length === 0;
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be a valid component',
          validationOptions
        ),
      },
    },
    validationOptions
  );
}

class CalloutComponentNestableDto
  extends CalloutComponentBaseDto
  implements CalloutComponentBaseNestableSchema
{
  @IsIn(calloutComponentNestableTypes)
  type!: CalloutComponentBaseNestableSchema['type'];

  @Equals(false)
  input!: false;

  @IsComponent({ each: true })
  @ComponentType()
  components!: CalloutComponentSchema[];
}

class SetCalloutNavigationDto implements SetCalloutNavigationSchema {
  @IsString()
  nextSlideId!: string;
}

class SetCalloutSlideDto implements SetCalloutSlideSchema {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  // @IsComponent({ each: true })
  // @ComponentType()
  @IsObject({ each: true }) // TODO: implement a Dto
  components!: CalloutComponentSchema[];

  @ValidateNested()
  @Type(() => SetCalloutNavigationDto)
  navigation!: SetCalloutNavigationDto;
}

export class SetCalloutFormDto implements SetCalloutFormSchema {
  @ValidateNested({ each: true })
  @Type(() => SetCalloutSlideDto)
  slides!: SetCalloutSlideDto[];
}

class GetCalloutNavigationDto implements GetCalloutNavigationSchema {
  @IsString()
  prevText!: string;

  @IsString()
  nextText!: string;

  @IsString()
  nextSlideId!: string;

  @IsString()
  submitText!: string;
}

class GetCalloutSlideDto implements GetCalloutSlideSchema {
  @IsString()
  id!: string;

  @IsString()
  title!: string;

  @IsComponent({ each: true })
  @ComponentType()
  components!: CalloutComponentSchema[];

  @ValidateNested()
  @Type(() => GetCalloutNavigationDto)
  navigation!: GetCalloutNavigationDto;
}

export class GetCalloutFormDto implements GetCalloutFormSchema {
  @ValidateNested({ each: true })
  @Type(() => GetCalloutSlideDto)
  slides!: GetCalloutSlideDto[];

  @IsObject()
  componentText!: Record<string, string>;
}
