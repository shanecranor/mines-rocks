import { createClient } from '@supabase/supabase-js'
interface RouterObj {
  [routeName: string]: Array<RouteInfo>;
}
interface RouteInfo {
  endpointName: string;
  endpoint: string;
  params?: string[]; // parameters to replace in the endpoint
  supabaseTable: string; // table to upsert data to
  requiredKeys?: string[];
}

const router = <RouterObj> {
  getCourses: [{
    endpointName: "courses",
    endpoint: "api/v1/courses?per_page=1000",
    supabaseTable: "course_summary_data",
    requiredKeys: ["id", "name"]
  }],
  getCourseData: [
    {
      endpointName: "assignments",
      endpoint: "api/v1/courses/course_id/assignments?per_page=1000&include[]=score_statistics",
      params: ["course_id"],
      supabaseTable: "assignment_data"
    },
    {
      endpointName: "assignment_groups",
      endpoint: "api/v1/courses/course_id/assignment_groups",
      params: ["course_id"],
      supabaseTable: "assignment_group_data",
    }
  ],
}

const API_URL = "https://elearning.mines.edu/"

export default {
  async fetch(request: Request, {SUPABASE_URL, SUPABASE_SERVICE_ROLE} : {SUPABASE_URL: string, SUPABASE_SERVICE_ROLE: string}) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)
    const { searchParams } = new URL(request.url)
    // get the route from the url params
    let route = <string | null> searchParams.get("route")
    if(!route) return new Response("ERROR: No route", {status: 400})
    // get the canvas auth token from the url params
    const AUTH_TOKEN = searchParams.get('bearer')
    if(!AUTH_TOKEN) return new Response("ERROR: No auth token", {status: 401})
    // the router object will tell us what to do based on the route string
    let routeInfoList = router[route]
    if(!routeInfoList) return new Response("ERROR: Invalid route", {status: 418})
    // loop through each endpoint in the route
    let status = 200
    let responses = {}
    for( let i = 0; i < routeInfoList.length; i++){
      let routeInfo = routeInfoList[i]
      const responseData = await doRoute(routeInfo, AUTH_TOKEN, searchParams, supabase)
      responses = {...responses, 
        [routeInfo.endpointName]: responseData
      }
      if (typeof responseData === 'string'){
        status = 500
      }
    }

    const encodedData = JSON.stringify(responses)
    return new Response(
      encodedData, {
        headers: {
          'Access-Control-Allow-Headers' : '*',
          'Access-Control-Allow-Origin' : '*',
          'content-type': 'application/json;charset=UTF-8'
        },
        status: status
      }
    )
  },
};

async function doRoute(routeInfo: RouteInfo, AUTH_TOKEN: string, searchParams: URLSearchParams, supabase: any) {
  let endpoint = routeInfo.endpoint
  // replace the params in the endpoint
  // with the values from the url params in the worker request
  for(let i = 0; routeInfo.params && i < routeInfo.params.length; i++){
    const param = routeInfo.params[i]
    const value = searchParams.get(param)
    if(!value) return `Empty value for ${param}`
    endpoint = endpoint.replace(param, value)
  }
  const queryURL = `${API_URL}${endpoint}`
  // return the query url if the test param is set for testing and debugging
  if(searchParams.get('test')){
    return queryURL
  }
  // fetch the data from the canvas api
  const response = await fetch(queryURL,
    { headers: { Authorization:
          `Bearer ${AUTH_TOKEN}`
    }}
  )
  // return the error if the response is not 200
  if(response.status !== 200){
    return `ERROR: ${response.status} ${response.statusText}`
  }
  const data = await response.json()
  // get the column names from the supabase psql function
  const { data: table_keys } = await supabase.rpc(
    'list_columns', { table_id: routeInfo.supabaseTable }
  )

  const cleanData = data.map((row: any) => {
    // add null values for missing keys
    for(let key of table_keys){
      if(!row[key]){
        row[key] = null
      }
    }
    // remove keys that don't exist in the table
    for(let key in row){
      if(!table_keys.includes(key)) delete row[key]
    }
    return row;
  }).filter((row: any) => {
    // filter out rows that don't have the required keys
    if(!routeInfo.requiredKeys) return true
    for (let key of routeInfo.requiredKeys){
      if(!row[key]) return false
    }
    return true
  })
  const { data: return_data, error } = await 
    supabase.from(routeInfo.supabaseTable).upsert(cleanData)
  if(error) return `Upsert ERROR: ${JSON.stringify(error)}`
  return cleanData
}


