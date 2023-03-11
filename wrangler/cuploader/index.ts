interface RoutesObj {
  [routeName: string]: Route;
}
interface Route {
  route: string;
  params?: string[];
  supabase?: string; //remove questionmark
}
const routes = <RoutesObj> {
  getCourses: {
    route: "api/v1/courses?per_page=1000",
    supabase: ""
  },
  getCourseData: {
    route: "api/v1/courses/course_id/assignments?per_page=1000&include[]=submission&include[]=score_statistics",
    params: ["course_id"]
  },
}

export default {
  async fetch(request: Request) {
    const API_URL = "https://elearning.mines.edu/"
    // fetch canvas course id  (could do this on the client if we wanted, prolly don't tho)
    // clean and send this data to supabase
    // fetch canvas assignments from course id
    // fetch assignment groups from course id as well
    // clean and send this data to a different supabase
    const { searchParams } = new URL(request.url)
    let route = <string | null> searchParams.get("route")
    const AUTH_TOKEN = searchParams.get('bearer')
    if(!route) return new Response("ERROR: No route")
    route = <string> route;
    let endpoint = routes[route]
    if(!endpoint) return new Response("ERROR: Invalid route")
    if(!AUTH_TOKEN) return new Response("ERROR: No auth token")
    let endpoint_str = endpoint.route
    for(let i = 0; endpoint.params && i < endpoint.params.length; i++){
      const param = endpoint.params[i]
      const value = searchParams.get(param)
      if(!value) return new Response(`Empty value for ${param}`)
      endpoint_str = endpoint_str.replace(param, value )
    }
    const queryURL = `${API_URL}${endpoint_str}`
    // add test to the url params to see the query url
    if(searchParams.get('test')){
      return new Response(queryURL)
    }
    const response = await fetch(queryURL,
      { headers: { Authorization:
            `Bearer ${AUTH_TOKEN}`
      }}
    )
    const data = await response.json()
    const encodedData = JSON.stringify(data)
    return new Response(
      encodedData, {
        headers: {
          'Access-Control-Allow-Headers' : '*',
          'Access-Control-Allow-Origin' : '*',
          'content-type': 'application/json;charset=UTF-8'
        }
      }
    )
  },
};



