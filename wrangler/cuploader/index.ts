import { createClient } from '@supabase/supabase-js'
import { RouterObj, RouteInfo, } from './types'
import { StatusCodes } from 'http-status-codes'
import { router } from './router'
const API_URL = "https://elearning.mines.edu/"
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request: Request, { SUPABASE_URL, SUPABASE_SERVICE_ROLE }: { SUPABASE_URL: string, SUPABASE_SERVICE_ROLE: string }) {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

    // Get routeInfoList and Auth token from the url
    const routeData = getRouteData(request.url);

    // return error if routeData is invalid
    if (routeData instanceof Response) return routeData;

    // routeData is valid, extract required data
    const { routeInfoList, AUTH_TOKEN } = routeData;

    // Execute canvas API calls and return the responses
    const { responses, status } = await getResponses(routeInfoList, AUTH_TOKEN, supabase);

    // Build and return the final API response
    return buildResponse(responses, status);
  },
};
function buildResponse(data: any, status: number) {
  const encodedData = JSON.stringify(data)
  return new Response(
    encodedData, {
    headers: {
      //todo: restrict to mines.rocks?
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*',
      'content-type': 'application/json;charset=UTF-8'
    },
    status: status
  }
  )
}
async function getResponses(routeInfoList: RouteInfo[], AUTH_TOKEN: string, urlParams: URLSearchParams, supabase: any) {
  // loop through each endpoint in the route
  let status = StatusCodes.OK
  let responses = {}

  for (let i = 0; i < routeInfoList.length; i++) {
    let routeInfo = routeInfoList[i]
    const responseData = await doRoute(routeInfo, AUTH_TOKEN, urlParams, supabase)
    responses = {
      ...responses,
      [routeInfo.endpointName]: responseData
    }
    if (typeof responseData === 'string') {
      status = StatusCodes.INTERNAL_SERVER_ERROR
    }
  }
  return { responses, status }
}
function getRouteData(url: string) {
  const { searchParams: urlParams } = new URL(url);
  // get the route from the url params
  let route = <string | null>urlParams.get("route")
  if (!route) return new Response("ERROR: No route", { status: StatusCodes.BAD_REQUEST })

  //TODO: move this to the header
  const AUTH_TOKEN = urlParams.get('bearer')
  if (!AUTH_TOKEN) return new Response("ERROR: No auth token", { status: StatusCodes.UNAUTHORIZED })

  // the router object will tell us what to do based on the route string
  let routeInfoList = router[route]
  if (!routeInfoList) return new Response("ERROR: Invalid route", { status: StatusCodes.BAD_REQUEST })
  return { routeInfoList, AUTH_TOKEN }
}
async function doRoute(routeInfo: RouteInfo, AUTH_TOKEN: string, searchParams: URLSearchParams, supabase: any) {
  // get the correct endpoint url
  let endpoint = routeInfo.endpoint
  if (routeInfo.params) {
    // replace the params in the endpoint with the values from the url params in the worker request
    for (let i = 0; i < routeInfo.params.length; i++) {
      const param = routeInfo.params[i]
      const value = searchParams.get(param)
      if (!value) return `Empty value for ${param}`
      endpoint = endpoint.replace(param, value)
    }
  }
  const queryURL = `${API_URL}${endpoint}`
  // return the query url if the test param is set for testing and debugging
  if (searchParams.get('testQueryURL')) {
    return queryURL
  }
  // fetch the data from the canvas api
  const response = await fetch(queryURL,
    {
      headers: {
        Authorization:
          `Bearer ${AUTH_TOKEN}`
      }
    }
  )
  // return the error if the response is not 200
  if (response.status !== StatusCodes.OK) {
    return `ERROR: ${response.status} ${response.statusText}`
  }
  const data = await response.json()
  // get the column names from the supabase psql function
  const { data: table_keys } = await supabase.rpc(
    'list_columns', { table_id: routeInfo.supabaseTable }
  )

  const cleanData = data.map((row: any) => {
    // add null values for missing keys
    for (let key of table_keys) {
      if (!row[key]) {
        row[key] = null
      }
    }
    // remove keys that don't exist in the table
    // TODO: specify the keys in the table in this file or import
    for (let key in row) {
      if (!table_keys.includes(key)) delete row[key]
    }
    return row;
  }).filter((row: any) => {
    // filter out rows that don't have the required keys
    if (!routeInfo.requiredKeys) return true
    for (let key of routeInfo.requiredKeys) {
      if (!row[key]) return false
    }
    return true
  })
  const { data: return_data, error } = await
    supabase.from(routeInfo.supabaseTable).upsert(cleanData)
  if (error) return `Upsert ERROR: ${JSON.stringify(error)}`
  return cleanData
}


