"use client";
import Head from "next/head";
// react query imports
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { Course, getCourseListFiltered } from "@/services/database";
import CourseComponent from "@/app/courses/course-component";

const queryClient = new QueryClient();

export default function Home() {
  const {
    isLoading,
    error,
    data: courseList,
  } = useQuery({
    queryKey: ["supaCourseList"],
    queryFn: getCourseListFiltered,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 6,
    cacheTime: 1000 * 60 * 60 * 6,
    //it will only refetch if the page is open for 6 hours
  });

  return (
    <>
      <Head>
        <title>View Course Data</title>
        <meta name="description" content="crowd sourced course data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <main>
          <h1>View Course Data</h1>
          {!courseList ? (
            <div>Loading...</div>
          ) : (
            courseList?.map((course: Course) => (
              <CourseComponent courseData={course} key={course.id} />
            ))
          )}
        </main>
      </QueryClientProvider>
    </>
  );
}
