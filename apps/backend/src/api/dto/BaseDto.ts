import {
  PaginatedQuery,
  Rule,
  RuleGroup,
  RuleOperator,
  RuleValue,
  isRuleGroup,
  ruleOperators,
} from '@beabee/beabee-common';

import { IsType } from '#api/validators/IsType';
import {
  Transform,
  TransformFnParams,
  Type,
  plainToInstance,
} from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class GetPaginatedRule implements Rule {
  @IsString()
  field!: string;

  @IsIn(ruleOperators)
  operator!: RuleOperator;

  @IsArray()
  @IsType(['string', 'boolean', 'number'], { each: true })
  value!: RuleValue[];
}

type GetPaginatedRuleGroupRule = GetPaginatedRuleGroup | GetPaginatedRule;

function transformRules(params: TransformFnParams): GetPaginatedRuleGroupRule {
  return params.value.map((v: GetPaginatedRuleGroupRule) =>
    plainToInstance<GetPaginatedRuleGroupRule, unknown>(
      isRuleGroup(v) ? GetPaginatedRuleGroup : GetPaginatedRule,
      v
    )
  );
}
export class GetPaginatedRuleGroup implements RuleGroup {
  @IsIn(['AND', 'OR'])
  condition!: 'AND' | 'OR';

  @IsArray()
  @ValidateNested({ each: true })
  @Transform(transformRules)
  rules!: GetPaginatedRuleGroupRule[];
}

export class GetExportQuery {
  @IsOptional()
  @ValidateNested()
  @Type(() => GetPaginatedRuleGroup)
  rules?: GetPaginatedRuleGroup;
}

export class GetPaginatedQuery
  extends GetExportQuery
  implements PaginatedQuery
{
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';
}
