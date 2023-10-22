import { createClient } from "@supabase/supabase-js";
import { Row, cleanAndFilterData } from "../shared-util/cleanData";
import { StatusCodes } from "http-status-codes";
import { getResponses, getRouteInfo } from "./getCanvasData";
import { buildResponse } from "./util";
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE: string;
}
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request: Request, { SUPABASE_URL, SUPABASE_SERVICE_ROLE }: Env) {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    // Get routeInfoList and Auth token from the url
    const routeData = getRouteInfo(request.url);
    const { searchParams: urlParams } = new URL(request.url);

    // return error if routeData is invalid
    if (routeData instanceof Response) return routeData;

    // routeData is valid, extract required data
    const { routeInfoList, AUTH_TOKEN } = routeData;

    // Execute canvas API calls and return the responses
    const { responses, status } = await getResponses(
      routeInfoList,
      AUTH_TOKEN,
      urlParams
    );

    //upsert data for each route in the responses
    for (const routeInfo of routeInfoList) {
      const { endpointName, supabaseTable, requiredKeys } = routeInfo;
      const data = responses[endpointName];
      if (typeof data === "string") {
        return new Response(data, {
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }
      const { data: tableKeys } = await supabase.rpc("list_columns", {
        table_id: supabaseTable,
      });
      const cleanedData = cleanAndFilterData(data, tableKeys, requiredKeys);
      //update the response with the cleaned data, or an error message
      responses[endpointName] = await upsertData(
        cleanedData,
        routeInfo.supabaseTable,
        supabase
      );
    }
    // Build and return the final API response
    return buildResponse(responses, status);
  },
};

/**
 * Upserts data to a Supabase table.
 * @param data - The data to upsert.
 * @param table - The name of the Supabase table to upsert the data to.
 * @param supabase - The Supabase client object.
 * @returns An error message if the upsert fails
 */
export async function upsertData(
  data: Row[],
  table: string,
  supabase: any
): Promise<Row[] | string> {
  // upsert the data to the supabase table
  const { data: returnData, error } = await supabase.from(table).upsert(data);
  if (error) return `Upsert ERROR: ${JSON.stringify(error)}`;
  return data;
}
