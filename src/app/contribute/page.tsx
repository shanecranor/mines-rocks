"use client";
import type { NextPage } from "next";
import { IGNORE_CLASSES } from "./ignoreClasses";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { redirect } from "next/dist/server/api-utils";
import { useQuery } from "@tanstack/react-query";
// Create a single supabase client for interacting with your database
import { createClient } from "@supabase/supabase-js";
import ConsentForm from "./consent";
import { observer, useObservable } from "@legendapp/state/react";
let API_KEY: any = process.env.NEXT_PUBLIC_API_KEY;
function API_URL(route: string, key?: string) {
  const url = "https://cuploader.shanecranor.workers.dev";
  if (!API_KEY) {
    API_KEY = localStorage.getItem("API_KEY");
  }
  if (key) return `${url}/?bearer=${key}&route=${route}`;
  if (API_KEY) return `${url}/?bearer=${API_KEY}&route=${route}`;
  console.error(".env.local API key not found and no key passed");
}

async function fetchCourseData(course_id: string, key?: string) {
  console.log(`fetching course data for ${course_id}`);
  const response = await fetch(
    `${API_URL("getCourseData", key)}&course_id=${course_id}`
  );
  const data = await response.json();
  return { data: data, status: response.status };
}
async function fetchCourseList(key?: string) {
  const response = await fetch(`${API_URL("getCourses", key)}`);
  return await response.json();
}

const Home: NextPage = observer(() => {
  const hasConsented = useObservable(false);
  if (!hasConsented.get())
    return <ConsentForm onSubmit={() => hasConsented.set(true)} />;
  const [canvasApiKey, setCanvasApiKey] = useState(API_KEY);
  const [courseIncludeList, setCourseIncludeList] = useState([]);
  const [courseUploadList, setCourseUploadList] = useState([]);

  const {
    isLoading,
    error,
    data: courseList,
  } = useQuery({
    queryKey: "courseList",
    queryFn: () => fetchCourseList(),
    onSuccess: (data: any) => {
      setCourseIncludeList(
        data?.courses?.map(
          (course: any) => false
          //!IGNORE_CLASSES.some((ignoreClass: string) => course.name.includes(ignoreClass))
        )
      );
      setCourseUploadList(data?.courses?.map((course: any) => ""));
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 6,
    cacheTime: 1000 * 60 * 60 * 6,
    //it will only refetch if the page is open for 6 hours
  });
  async function uploadCourses(courseList: any) {
    for (
      let courseIndex = 0;
      courseIndex < courseList.courses.length;
      courseIndex++
    ) {
      const course = courseList.courses[courseIndex];
      if (!courseIncludeList[courseIndex]) {
        console.log("SKIPPED");
        continue;
      }
      setCourseUploadList((oldState: any) =>
        oldState.map((status, idx) => {
          if (idx == courseIndex) {
            return { data: "loading", color: "LightGoldenRodYellow" };
          }
          return status;
        })
      );
      const courseData = await fetchCourseData(course.id);
      // console.log("wtf" + courseIndex + " " + course.id)
      // setCourseUploadList((oldState: any) => {
      //   console.log("SETwtf " + courseIndex + " " + course.id)
      //   return oldState
      // })
      const statusToColor = {
        200: "green",
        500: "orange",
      };
      setCourseUploadList((oldState: any) =>
        oldState.map((status, idx) => {
          if (idx == courseIndex) {
            return {
              data: courseData.data,
              color: statusToColor[courseData.status] || "red",
            };
          }
          return status;
        })
      );
      // await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }
  function parseCourseList(courseList: any) {
    //check if type of courseList.courses is string
    // if it is, then it is an error message (probably a better way to do this lol)
    if (typeof courseList.courses === "string")
      return JSON.stringify(courseList);
    return courseList.courses.map((course: any, idx: number) => {
      if (
        IGNORE_CLASSES.some((ignoreClass: string) =>
          course.name.includes(ignoreClass)
        )
      )
        return;
      return (
        <div
          key={`COURSEUPLOAD${course.id}`}
          style={{ background: courseUploadList[idx]?.color }}
        >
          <input
            type="checkbox"
            checked={courseIncludeList[idx]}
            onChange={() =>
              setCourseIncludeList((oldState: any) =>
                oldState.map((box: boolean, i: number) =>
                  idx === i ? !box : box
                )
              )
            }
          />
          {course.name}
        </div>
      );
    });
  }
  console.log("UPLOAD STATUS");
  console.log(courseUploadList);
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

      <main>
        <h1>Courses to be uploaded:</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {parseCourseList(courseList)}
            <button onClick={() => uploadCourses(courseList)}>
              Contribute
            </button>
          </>
        )}
        <br></br>
        <p>Paste your canvas API key here:</p>
        <input
          type="text"
          value={
            canvasApiKey ||
            (typeof window !== "undefined" && localStorage.getItem("API_KEY"))
          }
          style={{ width: "30%", marginBottom: "20px" }}
          onChange={(e) => {
            setCanvasApiKey(e.target.value);
            localStorage.setItem("API_KEY", e.target.value);
          }}
        ></input>
      </main>
    </>
  );
});

export default Home;
