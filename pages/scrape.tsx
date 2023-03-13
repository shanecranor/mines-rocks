import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { redirect } from 'next/dist/server/api-utils'
// Create a single supabase client for interacting with your database
import { createClient } from '@supabase/supabase-js'
let API_KEY: any = process.env.NEXT_PUBLIC_API_KEY
function API_URL(key?: string) {
  if (!API_KEY) {
    API_KEY = localStorage.getItem('API_KEY')
  }
  if (key) return `https://canvas.shanecranor.workers.dev/?bearer=${key}&req=`
  if (API_KEY) return `https://canvas.shanecranor.workers.dev/?bearer=${API_KEY}&req=`
  console.error(".env.local API key not found and no key passed")
}

async function fetchGroupData(course_id: string, key?: string){
  const response = await fetch(
    `${API_URL(key)}api/v1/courses/${course_id}/assignment_groups `
  );
  const data = await response.json();
  console.log( `${API_URL(key)}api/v1/courses/${course_id}/assignment_groups `)
  console.log(data)
  return (data);
}
async function fetchCourseList(key?: string) {
  const response = await fetch(
    `${API_URL(key)}api/v1/courses?per_page=1000`
  );
  return (await response.json());
}
async function fetchAssignments(course_id: string, key?: string) {
  const response = await fetch(
    `${API_URL(key)}api/v1/courses/${course_id}/assignments?per_page=1000&include[]=submission&include[]=score_statistics`
  );
  return (await response.json());
}
function parseAssignments(assignments: any, setAssignments: any, course_id: string, key?: string) {
  if (!assignments[course_id]) {
    return <button onClick={async () => {
      const data = await fetchAssignments(course_id, key)
      setAssignments((old) => ({ ...old, [course_id]: data }))
    }}>
      Load Assignments
    </button>
  }
  if(assignments[course_id]?.status=="unauthorized"){
    return <ul>Unauthorized for some reason</ul>
  }
  // return <ul>{JSON.stringify(assignments[course_id])}</ul>
  return <ul>{assignments[course_id]?.map(
    item => <li key={item.id}>{item.name} {JSON.stringify(item.score_statistics)}</li>
  )}</ul>
}
function parseCourseList(courseList: any, assignments: any, setAssignments: Function, groupData:any, setGroupData: any, key?: string) {
  return courseList.map(
    (course: any) => {
      
      return (
        <>

          <p>          
            <button onClick={
            async ()=> {
              const data = await fetchGroupData(course.id, key);
              console.log(data)
              setGroupData((old) => ({...old, [course.id]: data }));
            }}>
            get course groups</button>
            {course.name} {course.id} 
            <br/> 
            {/* {JSON.stringify(course)} */}
            groupdata:{JSON.stringify(groupData[course])} 
            </p> 
          {parseAssignments(assignments, setAssignments, course.id, key)}
        </>)
    }
  )
}


const Home: NextPage = () => {
  const [courseList, setCourseList] = useState();
  const [canvasApiKey, setCanvasApiKey] = useState(API_KEY);

  return (
    <>
      <Head>
        <title>Canvas TODO list</title>
        <meta name="description" content="find out what there is todo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* <button onClick = {async () => {
          await submitData()
        }
        }>click to post to database</button> */}
  

        <br></br>
        <button onClick={async () => setCourseList(await fetchCourseList(canvasApiKey))}>get CourseList</button><br />
        <br></br>
        {courseList ? parseCourseList(courseList, assignments, setAssignments, groupData, setGroupData, canvasApiKey) : "not loaded"}
        <br></br>
        {/* {assignments && <div dangerouslySetInnerHTML={{ __html: assignments[0].description }}></div>} */}
        {/* {assignments ? JSON.stringify(assignments) : "not loaded"} */}
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
