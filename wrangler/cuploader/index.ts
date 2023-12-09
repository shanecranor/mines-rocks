import { createClient } from '@supabase/supabase-js';
import { Row, cleanAndFilterData } from '../shared-util/cleanData';
import { StatusCodes } from 'http-status-codes';
import { getResponses, getRouteInfo } from './getCanvasData';
import { buildResponse } from './util';
interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE: string;
}
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request: Request, { SUPABASE_URL, SUPABASE_SERVICE_ROLE }: Env) {
    if (request.method === 'OPTIONS') {
      // Add a response to the preflight request
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'x-token',
        },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
    // Get routeInfoList and Auth token from the url
    const routeData = getRouteInfo(request);
    const { searchParams: urlParams } = new URL(request.url);

    // return error if routeData is invalid
    if (routeData instanceof Response) return routeData;

    // routeData is valid, extract required data
    const { routeInfoList, AUTH_TOKEN } = routeData;
    // Execute canvas API calls and return the responses
    const { responses, status } = await getResponses(
      routeInfoList,
      AUTH_TOKEN,
      urlParams,
    );
    //upsert data for each route in the responses
    for (const routeInfo of routeInfoList) {
      const { endpointName, supabaseTable, requiredKeys } = routeInfo;
      const data = responses[endpointName];
      if (typeof data === 'string') {
        return new Response(data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
          status: StatusCodes.INTERNAL_SERVER_ERROR,
        });
      }
      //if no supabase table is provided do not upload the data to supabase, just return it.
      if (supabaseTable === undefined) {
        responses[endpointName] = data;
        continue;
      }
      // add an upload date to the data
      // its a little jank because it'll get removed when the data is cleaned if it isn't a column in the db
      // the course_summary table has an upload_date column so it should work as expected
      data['upload_date'] = new Date().toISOString();

      const { data: tableKeys } = await supabase.rpc('list_columns', {
        table_id: supabaseTable,
      });
      let cleanedData = cleanAndFilterData(data, tableKeys, requiredKeys);
      if (routeInfo.dontOverwriteIfNull) {
        //load existing assignments for the target course from the table
        const supabaseResponse = await supabase
          .from(supabaseTable)
          .select('*')
          .eq('course_id', urlParams.get('course_id'));
        const existingData = supabaseResponse.data;
        cleanedData = mergeData(
          cleanedData,
          existingData,
          routeInfo.dontOverwriteIfNull,
        );
      }
      //if uploadData is false, just return the cleaned data
      if (!routeInfo.uploadData) {
        responses[endpointName] = cleanedData;
        continue;
      }
      //update the response with the cleaned data, or an error message
      responses[endpointName] = await upsertData(
        cleanedData,
        supabaseTable,
        supabase,
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
  supabase: any,
): Promise<Row[] | string> {
  // upsert the data to the supabase table
  const { data: returnData, error } = await supabase.from(table).upsert(data);
  if (error) return `Upsert ERROR: ${JSON.stringify(error)}`;
  return data;
}

const findRowByAssignmentId = (data, id) =>
  data?.find((r) => r.assignment_id === id);

const mergeRows = (newRow: Row, existingRow: Row, keepCols: string[]) => {
  return keepCols.reduce(
    (acc, key) => {
      if (newRow[key] === null && existingRow[key] !== null) {
        acc[key] = existingRow[key];
      }
      return acc;
    },
    { ...newRow },
  );
};

function mergeData(
  cleanedData: Row[],
  existingData: Row[],
  keepCols: string[],
) {
  return cleanedData.map((newRow) => {
    const existingRow = findRowByAssignmentId(
      existingData,
      newRow.assignment_id,
    );
    return existingRow
      ? mergeRows(newRow, existingRow, keepCols)
      : { ...newRow };
  });
}
