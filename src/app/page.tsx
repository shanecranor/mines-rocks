import Image from "next/image";
import styles from "./page.module.scss";

import Head from "next/head";
import {
  getAssignmentGroups,
  getAssignments,
  getCourseListFiltered,
} from "@/services/database";
import CourseComponent from "@/components/course-component/course-component";
import Checkbox from "@/components/form-components/checkbox";
import SearchResults from "@/components/search/search-results/search-results";
import SearchBar from "@/components/search/search-bar/search-bar";
import FilterSettings from "@/components/search/filter-settings/filter-settings";
export default async function Home() {
  const courses = await getCourseListFiltered();
  const assignmentGroups = await getAssignmentGroups();
  const assignments = await getAssignments();

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
        <SearchBar />
        <div className={styles["results-container"]}>
          <FilterSettings />
          <div className={styles["search-results"]}>
            {/* {courses.map((course) => {
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
            })} */}
            <SearchResults
              {...{
                courses,
                assignments,
                assignmentGroups,
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
