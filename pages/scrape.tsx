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
function parseCourseList(courseList: any, assignments: any, setAssignments: Function, key?: string) {
  return courseList.map(
    (course: any) => {
      return (
        <>
          <p>{course.name} {course.id}</p>
          {parseAssignments(assignments, setAssignments, course.id, key)}
        </>)
    }
  )
}


const Home: NextPage = () => {
  const [courseList, setCourseList] = useState();
  const [assignments, setAssignments] = useState({});
  const [categories, setCategories] = useState("");
  const [canvasApiKey, setCanvasApiKey] = useState(API_KEY);
  async function formatDataForDB(raw_data, all_keys){
    const objectMap = (obj, fn) =>
    Object.fromEntries(Object.entries(obj).map(
      ([k, v], i) => [k, fn(v, k, i)]
    ))
    //clean json from values
    let output_data = objectMap(raw_data, 
      (value, key, index) => (
        typeof(value) == "object" && value !== null ? JSON.stringify(value) : value
      )
    )
 
    // give every assignment every key set to null if it doesn't have
    for (let k in all_keys) 
      if (output_data[all_keys[k]] == null)
        output_data[all_keys[k]] = null
    //exit if datapoint has no ID
    if (output_data.id == null) return
    for (const [key, val] of Object.entries(output_data)){
      //if key is in the key list don't do anything
      if (all_keys.includes(key)) continue
      //if additional_data isn't an object yet, make it an object
      if(output_data.additional_data == null)
        output_data.additional_data = {}
      //move the key from output_data to the additional_data object
      output_data.additional_data[key] = val
      delete output_data[key]
    }
    return output_data
  }
  async function submitData(){
    const start_time = performance.now()
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: course_keys, error: get_cols_course_error } = await supabase.rpc('get_cols', { table_id: 'Courses' })
    if(get_cols_course_error) console.log(get_cols_course_error)
    let bulk_course_data = []
    for (let i in courseList){
      const course_data = await formatDataForDB(courseList[i], course_keys)
      if (!course_data) continue
      bulk_course_data.push(course_data)
    }
    console.log("SENDING COURSE METADATA")
    const { error: course_error } = await supabase
    .from('Courses')
    .upsert(bulk_course_data)
    if(course_error){
      console.log(bulk_course_data)
      console.log(course_error)
    }

    //parse assignments by course
    const { data: assignment_keys, error } = await supabase.rpc('get_cols', { table_id: 'Assignments' })
    for (let i in courseList){
      let bulk_assignment_data = []
      //skip to next course if course has no ID
      if(!assignments[courseList[i].id]) continue
      for(let j in assignments[courseList[i].id]){
        const assignment_data = formatDataForDB(assignments[courseList[i].id][j], assignment_keys)
        bulk_assignment_data.push(assignment_data)
      }
      const { error } = await supabase
        .from('Assignments')
        .upsert(bulk_assignment_data)
        if(error){
          console.log(`ERROR on ${courseList[i].name}`)
          console.log(courseList[i])
          console.log(bulk_assignment_data)
          console.log(error)
        }

    }
    const end_time = performance.now()
    console.log(`${end_time - start_time} milliseconds`)
  }
  return (
    <>
      <Head>
        <title>Canvas TODO list</title>
        <meta name="description" content="find out what there is todo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <button onClick = {async () => {
          await submitData()
        }
        }>click to post to database</button>
        <p>Per Class Text Categories (use &quot;|&quot; as a seperator):</p>
        <input type="text"
          value={categories}
          style={{ width: "100%", "marginBottom": "20px" }}
          onChange={(e) => setCategories(e.target.value)}
        ></input>

        <br></br>
        <button onClick={async () => setCourseList(await fetchCourseList(canvasApiKey))}>get CourseList</button><br />
        {/* <button onClick={async () => setAssignments(await fetchAssignments("40233"))}>get Assignements</button> */}
        <br></br>
        {courseList ? parseCourseList(courseList, assignments, setAssignments, canvasApiKey) : "not loaded"}
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
