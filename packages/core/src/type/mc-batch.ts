export interface MCBatch {
  id: string;
  status: string;
  finished_operations: number;
  total_operations: number;
  errored_operations: number;
  response_body_url: string;
}
