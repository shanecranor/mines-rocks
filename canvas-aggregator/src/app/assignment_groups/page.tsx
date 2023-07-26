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
  AssignmentGroup,
  Course,
  getAssignmentGroups,
  getAssignments,
  getCourseListFiltered,
} from "@/services/database";
import CourseComponent from "@/components/course-component/course-component";
import { Stats } from "fs";
import {
  getAssignmentsByCourse,
  getAssignmentGroupsFromAssignments,
  getStatsByGroup,
} from "@/services/data-aggregation";
import { groupCollapsed } from "console";

const queryClient = new QueryClient();

export default function Home() {
  const { isLoading: isLoadingCourses, data: courseList } = useQuery({
    queryKey: ["supaCourseList"],
    queryFn: getCourseListFiltered,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 6,
    cacheTime: 1000 * 60 * 60 * 6,
    //it will only refetch if the page is open for 6 hours
  });
  const { data: assignmentGroupList } = useQuery({
    queryKey: ["supaGroupList"],
    queryFn: getAssignmentGroups,
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
  if (assignmentList) {
    console.log("GAYYYYY");
    console.log(
      assignmentList.filter((a: Assignment) => a.id === 60669) //40213)
    );
    console.log(assignmentList.length);
  }
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
          {(isLoadingCourses || isLoading) && !assignmentGroupList ? (
            <div>Loading...</div>
          ) : (
            courseList?.map((course: Course) => {
              const courseAssignments = getAssignmentsByCourse(
                assignmentList,
                course
              );
              const courseAssignmentGroups = getAssignmentGroupsFromAssignments(
                assignmentGroupList,
                courseAssignments
              );
              const groupData = getStatsByGroup(
                courseAssignments,
                courseAssignmentGroups
              );
              return (
                <li key={course.id}>
                  <CourseComponent
                    courseData={course}
                    key={course.id}
                    assignments={getAssignmentsByCourse(assignmentList, course)}
                    assignmentGroups={courseAssignmentGroups}
                  />
                  <ul>
                    {courseAssignments.map((group) => (
                      <div key={group.id + "asdf"}>
                        {group.name} {group.score_statistics?.mean}
                      </div>
                    ))}
                    {groupData.map((stat) => (
                      <div key={stat.group.id}>
                        {stat.group.name}, Weight: {stat.group.group_weight}{" "}
                        Avg: {stat.stats.mean}
                      </div>
                    ))}
                  </ul>
                </li>
              );
            })
          )}
        </main>
      </QueryClientProvider>
    </>
  );
}
