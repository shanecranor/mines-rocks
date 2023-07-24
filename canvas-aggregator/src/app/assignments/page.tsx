"use client";
import Head from "next/head";
// react query imports
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  Assignment,
  Course,
  getAssignments,
  getAssignmentsByCourse,
  getGlobalCourseListFiltered,
} from "@/services/database";

const queryClient = new QueryClient();

export default function Home() {
  const { isLoading: isLoadingCourses, data: courseList } = useQuery({
    queryKey: ["supaCourseList"],
    queryFn: getGlobalCourseListFiltered,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 6,
    cacheTime: 1000 * 60 * 60 * 6,
    //it will only refetch if the page is open for 6 hours
  });

  const { isLoading, data: assignmentList } = useQuery({
    queryKey: ["supaAssignmentList"],
    queryFn: getAssignments,
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
          {isLoadingCourses || isLoading ? (
            <div>Loading...</div>
          ) : (
            courseList?.map((course: Course) => (
              <li key={course.id}>
                {course.name}
                <ul>
                  {getAssignmentsByCourse(assignmentList, course).map(
                    (assignment: Assignment) => (
                      <div key={assignment.id}>{assignment.name}</div>
                    )
                  )}
                </ul>
              </li>
            ))
          )}
        </main>
      </QueryClientProvider>
    </>
  );
}
