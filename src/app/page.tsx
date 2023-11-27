/* eslint-disable @next/next/no-img-element */
import styles from './page.module.scss';
import Head from 'next/head';
import {
  getAssignmentGroups,
  getAssignments,
  getCourseListFiltered,
  getBannerData,
} from '@/services/database';
import SearchResults from '@/components/search/search-results/search-results';
import SearchBar from '@/components/search/search-bar/search-bar';
import FilterSettings from '@/components/search/search-settings/filter-settings';
import Navbar from '@/components/navbar/navbar';

export const metadata = {
  title: 'mines.rocks: data driven course selection',
  description:
    'See grade distributions, assignment weights, and other historical data for your courses.',
};

export default async function Home() {
  // const courses = await getCourseListFiltered();
  // const assignmentGroups = await getAssignmentGroups();
  // const assignments = await getAssignments();
  // const bannerData = await getBannerData();
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles['heading-container']}>
          <img src="logo4.png" className={styles['logo']} alt="Logo" />
          <h1>
            Data driven course selection <i>rocks</i>
          </h1>
        </div>
        {/* <div className={styles['flavor-text']}>
          Database size: {assignments.length} assignments and {courses.length}{' '}
          classes!
        </div> */}
        <SearchBar />
        <div className={styles['results-container']}>
          <FilterSettings />
          <div className={styles['search-results']}>
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
            {/* <SearchResults
              {...{
                courses,
                assignments,
                assignmentGroups,
                bannerData,
              }}
            /> */}
          </div>
        </div>
      </main>
    </>
  );
}
