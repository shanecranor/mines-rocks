import { StatusCodes } from 'http-status-codes';
import { router } from './router';
import { RouteInfo } from './types';
import { Row, cleanAndFilterData } from '../shared-util/cleanData';
const API_URL = 'https://elearning.mines.edu/';
export async function getResponses(
  routeInfoList: RouteInfo[],
  AUTH_TOKEN: string,
  urlParams: URLSearchParams,
) {
  // loop through each endpoint in the route
  let status = StatusCodes.OK;
  let responses: { [key: string]: string | Row[] } = {};

  for (const routeInfo of routeInfoList) {
    const responseData = await getCanvasData(routeInfo, AUTH_TOKEN, urlParams);
    responses[routeInfo.endpointName] = responseData;
    if (typeof responseData === 'string') {
      status = StatusCodes.INTERNAL_SERVER_ERROR;
    } else if (!Array.isArray(responseData)) {
      responses[routeInfo.endpointName] = [responseData];
    }
  }
  return { responses, status };
}

/**
 * Parses the URL and returns an object containing the routeInfoList and the Canvas API authentication token.
 * @param {string} request - The request to the worker.
 * @returns An object containing the routeInfoList and the Canvas API authentication token.
 */
export function getRouteInfo(request: Request) {
  const url = request.url;
  const { searchParams: urlParams } = new URL(url);
  // get the route from the url params
  let route = <string | null>urlParams.get('route');
  if (!route)
    return new Response('ERROR: No route', {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      status: StatusCodes.BAD_REQUEST,
    });

  let AUTH_TOKEN = urlParams.get('bearer');
  //if the auth token is not in the url params, check the headers
  if (!AUTH_TOKEN) {
    const xToken = request.headers.get('x-token');
    if (xToken) {
      // remove the 'Bearer ' from the auth token
      AUTH_TOKEN = xToken.split(' ')[1];
    }
  }
  if (!AUTH_TOKEN)
    return new Response('ERROR: No auth token', {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      status: StatusCodes.UNAUTHORIZED,
    });

  // the router object will tell us what to do based on the route string
  let routeInfoList = router[route];
  if (!routeInfoList)
    return new Response('ERROR: Invalid route', {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      status: StatusCodes.BAD_REQUEST,
    });
  return { routeInfoList, AUTH_TOKEN };
}

/**
 * Builds the query URL for the Canvas API endpoint.
 * @param {string} endpoint - The Canvas API endpoint.
 * @param {string[]} routeParams - An array of route parameters to replace in the endpoint.
 * @param {URLSearchParams} searchParams - The URLSearchParams object containing the route and any necessary parameters.
 * @returns The query URL for the Canvas API endpoint.
 */
function buildQueryURL(
  endpoint: string,
  routeParams: string[] | undefined,
  searchParams: URLSearchParams,
) {
  if (!routeParams) return `${API_URL}${endpoint}`;
  let newEndpoint = endpoint;
  // replace the params in the endpoint with the values from the url params in the worker request
  for (let i = 0; i < routeParams.length; i++) {
    const param = routeParams[i];
    const value = searchParams.get(param);
    if (!value) return `Empty value for ${param}`;
    newEndpoint = newEndpoint.replace(param, value);
  }
  return `${API_URL}${newEndpoint}`;
}

/**
 * Returns the fetch options (adds auth token to the headers) for the Canvas API endpoint.
 * @param {string} authToken - The Canvas API authentication token.
 * @returns The fetch options for the Canvas API endpoint.
 */
function getFetchOptions(authToken: string): RequestInit {
  return {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };
}

/**
 * Fetches data from the Canvas API endpoint.
 * @param {RouteInfo} routeInfo - Information about the route.
 * @param {string} authToken - The Canvas API authentication token.
 * @param {URLSearchParams} searchParams - The URLSearchParams object containing the route and any necessary parameters.
 * @returns The data from the Canvas API endpoint.
 * @throws An error if the response status is not 200.
 */
export async function getCanvasData(
  routeInfo: RouteInfo,
  authToken: string,
  searchParams: URLSearchParams,
) {
  const queryURL = buildQueryURL(
    routeInfo.endpoint,
    routeInfo.params,
    searchParams,
  );
  // return the query url if the test param is set for testing and debugging
  if (searchParams.get('testQueryURL')) {
    return queryURL;
  }
  // fetch the data from the canvas api
  const response = await fetch(queryURL, getFetchOptions(authToken));

  // return the error if the response is not 200
  if (response.status !== StatusCodes.OK) {
    return `ERROR: ${response.status} ${response.statusText}`;
  }
  return await response.json();
}
