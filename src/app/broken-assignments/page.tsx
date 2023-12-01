/* eslint-disable @next/next/no-img-element */
import styles from './page.module.scss';

import {
  getAssignmentGroups,
  getAssignments,
  getCourseListFiltered,
  getBannerData,
  getDbSize,
  getAssignmentsForCourse,
  Assignment,
} from '@/services/database';
import SearchBar from '@/components/search/search-bar/search-bar';
import FilterSettings from '@/components/search/search-settings/filter-settings';
import Navbar from '@/components/navbar/navbar';
import { CloudResults } from '@/components/search/search-results/cloud-results/cloud-results';
import { create } from 'domain';
import { getCourseAttributes } from '@/services/data-aggregation';

export const metadata = {
  title: 'mines.rocks: data driven course selection',
  description:
    'See grade distributions, assignment weights, and other historical data for your courses.',
};

export default async function Home() {
  const numCourses = await getDbSize('course_summary_data');
  const courses = await getCourseListFiltered(false);
  const assignments = await getAssignments();
  // const assignmentMap = new Map<number, Assignment[]>();
  // for (const course of courses) {
  //   const assignments = await getAssignmentsForCourse(String(course.id));
  //   assignmentMap.set(course.id, assignments);
  // }
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles['heading-container']}>
          <img src="logo4.png" className={styles['logo']} alt="Logo" />
          <h1>
            Broken assignments !<i>rocks</i>
          </h1>
        </div>
        <div className={styles['results-container']}>
          <div className={styles['search-results']}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course ID</th>
                  <th>Points Possible</th>
                  <th>Mean Score</th>
                </tr>
              </thead>
              <tbody>
                {assignments
                  .filter((a) => {
                    if (!a.points_possible) {
                      return false;
                    }
                    if (!a.score_statistics?.mean) {
                      return false;
                    }
                    return (
                      Number(a.points_possible) <
                      Number(a.score_statistics?.mean)
                    );
                  })
                  .map((assignment) => (
                    <tr key={assignment.id}>
                      <td>{assignment.name}</td>
                      <td>
                        {
                          courses.filter((c) => c.id == assignment.course_id)[0]
                            .course_code
                        }
                      </td>
                      <td>{assignment.points_possible}</td>
                      <td>{JSON.stringify(assignment.score_statistics)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
