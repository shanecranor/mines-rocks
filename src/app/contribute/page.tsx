"use client";
import type { NextPage } from "next";
import { IGNORE_CLASSES } from "./ignoreClasses";
import Head from "next/head";
// Create a single supabase client for interacting with your database
import { createClient } from "@supabase/supabase-js";
import ConsentForm from "./consent";
import { observer, useObservable } from "@legendapp/state/react";
import { Course } from "@/services/database";

function API_URL(route: string, key?: string) {
  const url = "https://cuploader.shanecranor.workers.dev";
  return `${url}/?bearer=${key}&route=${route}`;
}

async function fetchCourseData(id: number, key?: string) {
  console.log(`fetching course data for ${id}`);
  const response = await fetch(
    `${API_URL("getCourseData", key)}&course_id=${id}`
  );
  const data = await response.json();
  return { data: data, status: response.status };
}

async function fetchCourseList(key?: string) {
  const response = await fetch(`${API_URL("getCourses", key)}`);
  const data = await response.json();
  return data.courses || data;
}


const Home: NextPage = observer(() => {
  const hasConsented$ = useObservable(true);
  const courseList$ = useObservable<Course[] | string>("no courses loaded");
  const selectedCourses$ = useObservable<number[]>([]);
  const courseData$ = useObservable<any>([]);
  const courseList = courseList$.get();

  const apiKey$ = useObservable<string>(localStorage.getItem("API_KEY") || "");
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, courseId: number) => {
    const isChecked = e.target.checked;
    const currentUploadList = selectedCourses$.get();
    let newUploadList: number[];

    if (isChecked) {
      // Add the courseId if the checkbox is checked
      newUploadList = [...currentUploadList, courseId];
    } else {
      // Remove the courseId if the checkbox is unchecked
      newUploadList = currentUploadList.filter(id => id !== courseId);
    }

    // Update the observable array
    selectedCourses$.set(newUploadList);
  };
  return (
    <>
      <Head>
        <title>Upload Course Data!</title>
        <meta
          name="description"
          content="Share data about courses that you have taken"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {hasConsented$.get() && (
        <main>
          <h1>Courses to be uploaded:</h1>
          <p>{JSON.stringify(courseData$.get())}</p>
          <ul>
            {
              Array.isArray(courseList) ? courseList.map((course: Course) => {

                return (
                  <li key={course.id} style={{ background: getCourseColor(selectedCourses$.get().includes(course.id), courseData$.get()[course.id]) }}>
                    {courseData$.get()[course.id]}
                    <input type="checkbox"
                      onChange={(e) => handleCheckboxChange(e, course.id)}
                      checked={selectedCourses$.get().includes(course.id)} />{course.name}
                  </li>
                )
              }) : courseList
            }
          </ul>
          <br></br>
          <label> Paste your canvas API key here: <br></br>
            <input
              type="text"
              style={{ width: "30%", marginBottom: "20px" }}
              value={apiKey$.get()}
              onChange={(e) => {
                apiKey$.set(e.target.value);
                //only store the key if we are in development mode, this isn't super secure so not ideal for prod 
                if (process && process.env.NODE_ENV === 'development')
                  localStorage.setItem("API_KEY", e.target.value);
              }}
            ></input>
          </label>
          <button onClick={async () => {
            const data = await fetchCourseList(apiKey$.get())
            courseList$.set(data);
            if (Array.isArray(data)) {
              const filteredData = data.filter((course: Course) => {
                return course.name && !IGNORE_CLASSES.includes(course.name);
              });
              courseList$.set(filteredData);
              // selectedCourses$.set(filteredData.map((course: Course) => course.id));
            }
          }}>
            Load Courses
          </button>
          <button onClick={() => uploadCourses(courseList$, selectedCourses$, apiKey$, courseData$)}>
            Contribute selected courses!
          </button>
        </main>
      )}
    </>
  );
});
function getCourseColor(isSelected: boolean, statusCode: number | undefined) {
  if (statusCode === 200) return "green"
  if (statusCode === -1) return "steelblue"
  if (statusCode && statusCode !== 200) return "red"
  if (isSelected) return "#FFFFFF3A"
  return "none"

}
async function uploadCourses(courseList$: any, selectedCourses$: any, apiKey$: any, courseData$: any) {
  const courseList = courseList$.get();
  const selectedCourses = selectedCourses$.get();
  const apiKey = apiKey$.get();
  if (!apiKey) {
    alert("No API key entered!");
    return;
  }
  if (!Array.isArray(courseList)) {
    alert("No courses loaded!");
    return;
  }
  if (selectedCourses.length === 0) {
    alert("No courses selected!");
    return;
  }

  for (const id of selectedCourses) {
    courseData$.set({ ...courseData$.get(), [id]: -1 })
    const response = await fetchCourseData(id, apiKey)
    courseData$.set({ ...courseData$.get(), [id]: response.status })
  }
}
export default Home;
