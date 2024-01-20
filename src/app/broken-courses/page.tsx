/* eslint-disable @next/next/no-img-element */
import styles from './page.module.scss';

import {
  getCourseListFiltered,
  getDbSize,
  getAssignmentsForCourse,
  Assignment,
} from '@/services/database';
import Navbar from '@/components/navbar/navbar';
import { getCourseAttributes } from '@/services/data-aggregation';

export const metadata = {
  title: 'mines.rocks: data driven course selection',
  description:
    'See grade distributions, assignment weights, and other historical data for your courses.',
};

export default async function Home() {
  const numCourses = await getDbSize('course_summary_data');
  const courses = await getCourseListFiltered(false);
  const assignmentMap = new Map<number, Assignment[]>();
  for (const course of courses) {
    const assignments = await getAssignmentsForCourse(String(course.id));
    assignmentMap.set(course.id, assignments);
  }
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles['heading-container']}>
          <img src="logo4.png" className={styles['logo']} alt="Logo" />
          <h1>
            Broken courses !<i>rocks</i>
          </h1>
        </div>
        <div className={styles['results-container']}>
          <div className={styles['search-results']}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Course Code</th>
                  <th>Name</th>
                  <th># Assignments</th>
                </tr>
              </thead>
              <tbody>
                {courses
                  .filter((course) => {
                    try {
                      getCourseAttributes(course);
                      return false;
                    } catch (e) {
                      return true;
                    }
                  })
                  .map((course) => (
                    <tr key={course.id}>
                      <td>{course.id}</td>
                      <td>{course.course_code}</td>
                      <td>{course.name}</td>
                      <td>{assignmentMap?.get(course.id)?.length}</td>
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
