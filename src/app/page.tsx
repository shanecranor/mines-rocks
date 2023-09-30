import Image from "next/image";
import styles from "./page.module.scss";
// import {
//   QueryClient,
//   QueryClientProvider,
//   useQuery,
// } from "@tanstack/react-query";
// import { useObservable } from "@legendapp/state/react";

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
// import { observable } from "@legendapp/state";
import { set } from "@legendapp/state/src/ObservableObject";
import {
  getAssignmentsByCourse,
  getStatsPerGroup,
} from "@/services/data-aggregation";

// const queryClient = new QueryClient();
// const courses$ = observable<Course[]>([]);
// const assignments$ = observable<Assignment[]>([]);
// const assignmentGroups$ = observable<AssignmentGroup[]>([]);
export default async function Home() {
  const courses = await getCourseListFiltered();
  const assignmentGroups = await getAssignmentGroups();
  const assignments = await getAssignments();
  // const searchOptions$ = useObservable({
  //   searchText: "",
  //   semester: {
  //     spring: true,
  //     fall: true,
  //     summer: true,
  //   },
  // });

  // if (!courses || !assignments || !assignmentGroups) return <div>loading</div>;
  // courses$.set(courses);
  // assignments$.set(assignments);
  // assignmentGroups$.set(assignmentGroups);
  return (
    <>
      <Head>
        <title>Find your perfect course</title>
        <meta name="description" content="crowd sourced course data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles["nav-container"]}>
        <nav className={styles.nav}>
          <div className={styles["site-logo"]}>mines.rocks</div>
          <div className={styles["nav-links"]}>
            <a href="https://syllabuddies.pages.dev/">Syllabuddies</a>
            {/* <a>About</a> */}
            <a>Contribute</a>
          </div>
        </nav>
      </div>
      <main className={styles.main}>
        <h1>
          Data driven course selection <i>rocks</i>
        </h1>
        {/* <div className={styles["search-container"]}>
          <input
            type="text"
            placeholder="Search for a course"
            onChange={(e) => searchOptions$.searchText.set(e.target.value)}
          ></input>
        </div> */}
        <div className={styles["results-container"]}>
          <aside className={styles["filter-settings"]}>
            <div>Semester</div>
            {/* <Checkbox label="Spring" state$={searchOptions$.semester.spring} />
            <Checkbox label="Fall" state$={searchOptions$.semester.fall} />
            <Checkbox label="Summer" state$={searchOptions$.semester.summer} /> */}
            {/* Sort:
              <div>Course Code</div>
              <div>Average</div>
              <div>Theoretical Min</div>
              <div>Theoretical Max</div> */}
          </aside>
          <div className={styles["search-results"]}>
            {courses.map((course) => {
              const courseAssignments = getAssignmentsByCourse(
                assignments,
                course
              );
              const stats = getStatsPerGroup(
                courseAssignments,
                assignmentGroups
              );
              return (
                <CourseComponent
                  courseData={course}
                  key={course.id}
                  assignments={courseAssignments}
                  groupStats={stats}
                />
              );
            })}
            {/* <SearchResults
              {...{
                courses$,
                assignments$,
                assignmentGroups$,
                searchOptions$,
              }}
            /> */}
          </div>
        </div>
      </main>
    </>
  );
}
