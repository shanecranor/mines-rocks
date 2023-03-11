import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { redirect } from 'next/dist/server/api-utils'
import { Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { TimeScale, Colors } from 'chart.js'
import { Bubble } from 'react-chartjs-2';
import { homedir } from 'os'
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
ChartJS.register(LinearScale, TimeScale, PointElement, Tooltip, Legend, Colors);

import Calendar from '../components/calendar/Calendar'
import test from 'node:test'
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
function parseAssignments(assignments: any, setAssignments: any, course_id: string, key?: string) {
  if (!assignments[course_id]) {
    return <button onClick={async () => {
      const data = await fetchAssignments(course_id, key)
      setAssignments((old) => ({ ...old, [course_id]: data }))
    }}>
      Load Assignments
    </button>
  }
  const total = assignments[course_id].reduce(
    (p, item) => (p + Number(item.points_possible)), 0
  )
  const rdata = assignments[course_id].map( item => ({
      category: item.assignment_group_id,
      // label: item.name,
      // name: item.name,
      v: item.name,
      x: item.due_at,
      y: item?.score_statistics?.mean / item.points_possible * 100,
      r: (item.points_possible / total * 300)+2,
    })
  )
  function groupBy(arr, key) {
    return arr.reduce((acc, cur) => {
      acc[cur[key]] = [...acc[cur[key]] || [], cur];
      return acc;
    }, []).filter(Boolean);
  }
  // console.log("GROUPIN")
  // console.log(groupBy(rdata, "category"))
  const groupData = groupBy(rdata, "category").map(item => ({
    label: String(item[0].category),
    data: item,
    backgroundColor: `rgba(${(item[0].category*40)%255}, 30, ${(item[0].category*50)%255}, 0.6)`,
  }))
  // console.log("GROUPDATA")
  // console.log(groupData)
 
  const data = {
		datasets:
      groupData
	  };
  const options = {
    plugins: {
    tooltip: {
      callbacks: {
         label: function(t: any, d: any) {
            return t.raw.v;
         }
      }
    },
  },
		scales: {
		  y: {
			beginAtZero: true,
		  },
		  x: {
			  type: 'time',
			  adapters: { 
				  date: {
					locale: enUS, 
				  },
				}, 
			  time: {
				  unit: 'month'
			  }
		  }
		},

	  };
  return <> <ul>{assignments[course_id].map(
    item => <li key={item.id}>{item.name} {item.due_at}</li>
  )}</ul>
  <Bubble options={options} data={data} /></>;
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


const Home: NextPage = () => {
  const [courseList, setCourseList] = useState();
  const [assignments, setAssignments] = useState({});
  const [categories, setCategories] = useState("");
  const [canvasApiKey, setCanvasApiKey] = useState(API_KEY);
  return (
    <>
      <Head>
        <title>Canvas TODO list</title>
        <meta name="description" content="find out what there is todo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p>Per Class Text Categories (use &quot;|&quot; as a seperator):</p>
        <input type="text"
          value={categories}
          style={{ width: "100%", "marginBottom": "20px" }}
          onChange={(e) => setCategories(e.target.value)}
        ></input>

        {/* render calendar */}
        {(assignments && courseList) && <Calendar {...{ assignments, courseList, categories }} />}

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
