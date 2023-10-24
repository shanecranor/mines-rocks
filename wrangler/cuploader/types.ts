export interface RouterObj {
  [routeName: string]: Array<RouteInfo>;
}

export interface RouteInfo {
  endpointName: string;
  endpoint: string;
  params?: string[]; // string list of parameters to find/replace in the endpoint
  supabaseTable: string; // table to upsert data to
  requiredKeys?: string[];
  // list of keys not to overwrite if the new value is null and the old value is not null
  dontOverwriteIfNull?: string[];
  //for example, if one person uploads a class and submits an assignment so we can see the score breakdown
  //then another person uploads the class and doesn't submit an assignment, we don't want to overwrite the score breakdown
}
