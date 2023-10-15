export interface RouterObj {
  [routeName: string]: Array<RouteInfo>;
}
export interface RouteInfo {
  endpointName: string;
  endpoint: string;
  params?: string[]; // string list of parameters to find/replace in the endpoint
  supabaseTable: string; // table to upsert data to
  requiredKeys?: string[];
}

