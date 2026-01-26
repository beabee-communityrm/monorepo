export type ExportTypes = 'json' | 'sql';

export type SubsetTypes = 'full' | 'demo';

export interface ExportDatabaseArgs {
  dryRun: boolean;
  type: string;
  anonymize: boolean;
  subset: string;
}
export interface ExportDatabaseArgs1 {
  dryRun: boolean;
  type: ExportTypes;
  anonymize: boolean;
  subset: SubsetTypes;
}
