import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { redirect } from 'next/dist/server/api-utils'
import {useQuery} from 'react-query'
// Create a single supabase client for interacting with your database
import { createClient } from '@supabase/supabase-js'
let API_KEY: any = process.env.NEXT_PUBLIC_API_KEY
function API_URL(route: string, key?: string,) {
  const url = "https://cuploader.shanecranor.workers.dev"
  if (!API_KEY) {
    API_KEY = localStorage.getItem('API_KEY')
  }
  if (key) return `${url}/?bearer=${key}&route=${route}`
  if (API_KEY) return `${url}/?bearer=${API_KEY}&route=${route}`
  console.error(".env.local API key not found and no key passed")
}

async function fetchCourseData(course_id: string, key?: string){
  const response = await fetch(
    `${API_URL('getCourseData',key)}?course_id=${course_id}`
  );
  const data = await response.json();
  console.log( `${API_URL("getCourseData", key)}api/v1/courses/${course_id}/assignment_groups `)
  console.log(data)
  return (data);
}
async function fetchCourseList(key?: string) {
  const response = await fetch(
    `${API_URL('getCourses',key)}`
  );
  return (await response.json());
}

// function parseAssignments(assignments: any, setAssignments: any, course_id: string, key?: string) {
//   if (!assignments[course_id]) {
//     return <button onClick={async () => {
//       const data = await fetchAssignments(course_id, key)
//       setAssignments((old) => ({ ...old, [course_id]: data }))
//     }}>
//       Load Assignments
//     </button>
//   }
//   if(assignments[course_id]?.status=="unauthorized"){
//     return <ul>Unauthorized for some reason</ul>
//   }
//   // return <ul>{JSON.stringify(assignments[course_id])}</ul>
//   return <ul>{assignments[course_id]?.map(
//     item => <li key={item.id}>{item.name} {JSON.stringify(item.score_statistics)}</li>
//   )}</ul>
// }
function parseCourseList(courseList: any) {
  return courseList.map(
    (course: any) => {
      return (
        <>
          <p>          
            {course.name}
          </p> 
        </>)
    }
  )
}


const Home: NextPage = () => {
  const { isLoading, error, data: courseList } = useQuery(
		{
			queryKey: "courseList", 
			queryFn: () => fetchCourseList(),
			refetchOnWindowFocus: false, 
			staleTime: 1000 * 60 * 60 * 6, 
			cacheTime: 1000 * 60 * 60 * 6  
			//it will only refetch if the page is open for 6 hours
		}
	);
  const [canvasApiKey, setCanvasApiKey] = useState(API_KEY);

  return (
    <>
      <Head>
        <title>Upload Course Data!</title>
        <meta name="description" content="Share data about courses that you have taken" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Courses to be uploaded:</h1>
        {courseList ? parseCourseList(courseList.courses) : "not loaded"}
        <br></br>
        <p>Paste your canvas API key here:</p>
        <input type="text"
          value={canvasApiKey || typeof window !== 'undefined' && localStorage.getItem('API_KEY')}
          style={{ width: "30%", "marginBottom": "20px" }}
          onChange={(e) => {
            setCanvasApiKey(e.target.value);
            localStorage.setItem('API_KEY', e.target.value);
          }}
        ></input>
      </main>
    </>
  )
}

export default Home
