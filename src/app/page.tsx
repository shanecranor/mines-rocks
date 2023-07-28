"use client";
import Image from "next/image";
import styles from "./page.module.scss";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useObservable } from "@legendapp/state/react";

import Head from "next/head";
import {
  Assignment,
  AssignmentGroup,
  Course,
  getAssignmentGroups,
  getAssignments,
  getCourseListFiltered,
} from "@/services/database";
import CourseComponent, {
  getCourseAttributes,
} from "@/components/course-component/course-component";
import Checkbox from "@/components/form-components/checkbox";
import SearchResults from "@/components/search-results/search-results";
import { observable } from "@legendapp/state";
import { set } from "@legendapp/state/src/ObservableObject";

const queryClient = new QueryClient();
const courses$ = observable<Course[]>([]);
const assignments$ = observable<Assignment[]>([]);
const assignmentGroups$ = observable<AssignmentGroup[]>([]);
export default function Home() {
  const searchOptions$ = useObservable({
    semester: {
      spring: true,
      fall: true,
      summer: true,
    },
  });
  const { data: courses } = useQuery({
    queryKey: ["supaCourseList"],
    queryFn: getCourseListFiltered,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 6,
    cacheTime: 1000 * 60 * 60 * 6,
    //it will only refetch if the page is open for 6 hours
  });
  const { data: assignmentGroups } = useQuery({
    queryKey: ["supaGroupList"],
    queryFn: getAssignmentGroups,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 6,
    cacheTime: 1000 * 60 * 60 * 6,
    //it will only refetch if the page is open for 6 hours
  });

  const { data: assignments } = useQuery({
    queryKey: ["supaAssignmentList"],
    queryFn: getAssignments,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 6,
    cacheTime: 1000 * 60 * 60 * 6,
    //it will only refetch if the page is open for 6 hours
  });
  if (!courses || !assignments || !assignmentGroups) return <div>loading</div>;
  courses$.set(courses);
  assignments$.set(assignments);
  assignmentGroups$.set(assignmentGroups);
  return (
    <>
      <Head>
        <title>Find your perfect course</title>
        <meta name="description" content="crowd sourced course data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <div className={styles["nav-container"]}>
          <nav className={styles.nav}>
            <div className={styles.logo}></div>
            <div className={styles["nav-links"]}>
              <div>Home</div>
              <div>About</div>
              <div>Contribute</div>
            </div>
          </nav>
        </div>
        <main className={styles.main}>
          <h1>Data driven course selection</h1>
          <div className={styles["search-container"]}>
            <input type="text" placeholder="Search for a course"></input>
          </div>
          <div className={styles["results-container"]}>
            <div className={styles["filter-settings"]}>
              <div>Semester</div>
              <Checkbox
                label="Spring"
                state$={searchOptions$.semester.spring}
              />
              <Checkbox label="Fall" state$={searchOptions$.semester.fall} />
              <Checkbox
                label="Summer"
                state$={searchOptions$.semester.summer}
              />
              {/* Sort:
              <div>Course Code</div>
              <div>Average</div>
              <div>Theoretical Min</div>
              <div>Theoretical Max</div> */}
            </div>
            <SearchResults
              {...{
                courses$,
                assignments$,
                assignmentGroups$,
                searchOptions$,
              }}
            />
          </div>
        </main>
      </QueryClientProvider>
    </>
  );
}
