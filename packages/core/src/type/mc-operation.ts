interface MCOperationNoBody {
  method: 'GET' | 'DELETE' | 'POST';
  path: string;
  params?: string;
  operation_id: string;
  body?: undefined;
}

interface MCOperationWithBody {
  method: 'POST' | 'PATCH' | 'PUT';
  path: string;
  params?: Record<string, string>;
  body: string;
  operation_id: string;
}

export type MCOperation = MCOperationNoBody | MCOperationWithBody;
