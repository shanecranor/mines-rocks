import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { redirect } from 'next/dist/server/api-utils'
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { TimeScale, Colors } from 'chart.js'
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
ChartJS.register(LinearScale, TimeScale, PointElement, Tooltip, Legend, Colors);

let API_KEY: any = process.env.NEXT_PUBLIC_API_KEY
function API_URL(key?: string) {
  if (!API_KEY) {
    API_KEY = localStorage.getItem('API_KEY')
  }
  if (key) return `https://canvas.shanecranor.workers.dev/?bearer=${key}&req=`
  if (API_KEY) return `https://canvas.shanecranor.workers.dev/?bearer=${API_KEY}&req=`
  console.error(".env.local API key not found and no key passed")
}
async function fetchCourseList(key?: string) {
  const response = await fetch(
    `${API_URL(key)}api/v1/courses?per_page=1000&enrollment_state=active`
  );
  return (await response.json());
}
async function fetchAssignments(course_id: string, key?: string) {
  const response = await fetch(
    `${API_URL(key)}api/v1/courses/${course_id}/assignments?per_page=1000&include[]=submission&include[]=score_statistics`
  );
  return (await response.json());
}

function parseCourseList(courseList: any, assignments: any, setAssignments: Function, key?: string) {
  return courseList.map(
    (course: any) => {
      return (course.course_code &&
        <>
          <p>{course.name} {course.id}</p>
          {parseAssignments(assignments, setAssignments, course.id, key)}
        </>)
    }
  )
}


const Demo: NextPage = () => {
  const [canvasApiKey, setCanvasApiKey] = useState(API_KEY);
	// const { isLoading, error, data: coursesData } = useQuery(
	// 	{
	// 		queryKey: "courseData", 
	// 		queryFn: () => fetchCourses(),
	// 		refetchOnWindowFocus: false, 
	// 		staleTime: 1000 * 60 * 60 * 3, 
	// 		cacheTime: 1000 * 60 * 60 * 3  
	// 		//it will only refetch if the page is open for 3 hours
	// 	}
	// )
  return (
    <>
      <Head>
        <title>Canvas API Project Home Page</title>
        <meta name="description" content="See the data on classes at mines" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <input type="text"></input>
        <p>Paste your canvas API key here:</p>
        <input type="text"
          value={canvasApiKey || typeof window !== 'undefined' && localStorage.getItem('API_KEY')}
          style={{ width: "30%", "marginBottom": "20px" }}
          onChange={(e) => {
            setCanvasApiKey(e.target.value);
            localStorage.setItem('API_KEY', e.target.value);
          }}></input>
      </main>
    </>
  )
}

export default Demo
