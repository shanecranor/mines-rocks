'use client';
import type { NextPage } from 'next';
import { IGNORE_CLASSES } from './ignoreClasses';
import Head from 'next/head';
// Create a single supabase client for interacting with your database
import { createClient } from '@supabase/supabase-js';
import ConsentForm from './consent';
import { observer, useObservable } from '@legendapp/state/react';
import { Course, filterCourses } from '@/services/database';
import styles from './page.module.scss';
import Navbar from '@/components/navbar/navbar';
import {
  getCourseAttributes,
  splitCourseCode,
} from '@/services/data-aggregation';
import Instructions from './instructions';

function API_URL(route: string, key?: string) {
  const url = 'https://cuploader.shanecranor.workers.dev';
  return `${url}/?bearer=${key}&route=${route}`;
}
async function getBannerData(
  year: string,
  season: string,
  subject: string,
  courseNumber: string,
) {
  console.log(
    `getting banner data for ${year} ${season} ${subject} ${courseNumber}`,
  );
  const url = new URL('https://banner-uploader.shanecranor.workers.dev/');
  url.searchParams.append('year', year);
  url.searchParams.append('season', season);
  url.searchParams.append('subject', subject);
  url.searchParams.append('courseNumber', courseNumber);

  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function fetchCourseData(id: number, key?: string) {
  console.log(`fetching course data for ${id}`);
  const response = await fetch(
    `${API_URL('getCourseData', key)}&course_id=${id}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
  const data = await response.json();
  return { data: data, status: response.status };
}

async function fetchCourseList(key?: string) {
  const response = await fetch(`${API_URL('getCourses', key)}`);
  const data = await response.json();
  return data.courses || data;
}

const Home: NextPage = observer(() => {
  const hasConsented$ = useObservable(false);
  const courseList$ = useObservable<Course[] | string>('no courses loaded');
  const selectedCourses$ = useObservable<number[]>([]);
  const courseData$ = useObservable<any>([]);
  const courseList = courseList$.get();
  const problemCourses$ = useObservable<string[]>([]);
  const apiKey$ = useObservable<string>('');
  if (typeof window !== 'undefined') {
    apiKey$.set(localStorage.getItem('API_KEY') || apiKey$.get());
  }
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    courseId: number,
  ) => {
    const isChecked = e.target.checked;
    const currentUploadList = selectedCourses$.get();
    let newUploadList: number[];

    if (isChecked) {
      // Add the courseId if the checkbox is checked
      newUploadList = [...currentUploadList, courseId];
    } else {
      // Remove the courseId if the checkbox is unchecked
      newUploadList = currentUploadList.filter((id) => id !== courseId);
    }

    // Update the observable array
    selectedCourses$.set(newUploadList);
  };
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
      <Navbar />
      {!hasConsented$.get() && (
        <ConsentForm onSubmit={() => hasConsented$.set(true)} />
      )}
      {hasConsented$.get() && (
        <main className={styles.main}>
          <Instructions></Instructions>
          <h1>Courses to be uploaded:</h1>
          {Array.isArray(courseList) && (
            <table className={styles['upload-table']}>
              <thead>
                <tr>
                  <th>status</th>
                  <th>upload?</th>
                  <th>code</th>
                  <th>year</th>
                  <th>full name</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(courseList) &&
                  courseList.map((course: Course) => {
                    try {
                      const courseAttributes = getCourseAttributes(course);
                      return (
                        <tr
                          key={course.id}
                          style={{
                            background: getCourseColor(
                              selectedCourses$.get().includes(course.id),
                              courseData$.get()[course.id],
                            ),
                          }}
                        >
                          <td>{courseData$.get()[course.id] || 0}</td>
                          <td>
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                handleCheckboxChange(e, course.id)
                              }
                              checked={selectedCourses$
                                .get()
                                .includes(course.id)}
                            />
                          </td>
                          <td>{courseAttributes.courseCode}</td>
                          <td>
                            {courseAttributes.semester}{' '}
                            {courseAttributes.courseYear}
                          </td>
                          <td>{courseAttributes.courseName}</td>
                        </tr>
                      );
                    } catch (e) {
                      return (
                        <tr
                          key={course.id}
                          style={{
                            background: getCourseColor(
                              selectedCourses$.get().includes(course.id),
                              courseData$.get()[course.id],
                            ),
                          }}
                        >
                          <td>{courseData$.get()[course.id] || 0}</td>
                          <td>
                            <input
                              type="checkbox"
                              onChange={(e) =>
                                handleCheckboxChange(e, course.id)
                              }
                              checked={selectedCourses$
                                .get()
                                .includes(course.id)}
                            />
                          </td>
                          <td>unknown course</td>
                          <td>{course.name}</td>
                          <td>{course.course_code}</td>
                        </tr>
                      );
                    }
                  })}
              </tbody>
            </table>
          )}
          <br></br>
          <label>
            {' '}
            Paste your canvas API key here: <br></br>
            <input
              type="text"
              style={{ width: '30%', marginBottom: '20px' }}
              value={apiKey$.get()}
              onChange={(e) => {
                apiKey$.set(e.target.value);
                //only store the key if we are in development mode, this isn't super secure so not ideal for prod
                if (process && process.env.NODE_ENV === 'development')
                  localStorage.setItem('API_KEY', e.target.value);
              }}
            ></input>
          </label>
          <button
            onClick={async () => {
              try {
                const data = await fetchCourseList(apiKey$.get());
                courseList$.set(data);
                if (Array.isArray(data)) {
                  const filteredData = filterCourses(data, true);
                  // courseList$.set(filteredData);
                  selectedCourses$.set(
                    filteredData.map((course: Course) => course.id),
                  );
                } else {
                  alert('Invalid API key');
                }
              } catch {
                alert('Invalid API key');
              }
            }}
          >
            Load Courses
          </button>
          <button
            onClick={() =>
              uploadCourses(
                courseList$,
                selectedCourses$,
                apiKey$,
                courseData$,
                problemCourses$,
              )
            }
          >
            Contribute selected courses!
          </button>
        </main>
      )}
    </>
  );
});
function getCourseColor(isSelected: boolean, statusCode: number | undefined) {
  if (statusCode === 200) return 'green';
  if (statusCode === -1) return 'lightsteelblue';
  if (statusCode === -2) return 'steelblue';

  if (statusCode && statusCode !== 200) return 'red';
  if (isSelected) return '#FFFFFF3A';
  return 'none';
}

async function uploadCourses(
  courseList$: any,
  selectedCourses$: any,
  apiKey$: any,
  courseData$: any,
  problemCourses$: any,
) {
  const courseList = courseList$.get();
  const selectedCourses = selectedCourses$.get();
  const apiKey = apiKey$.get();
  if (!apiKey) {
    alert('No API key entered!');
    return;
  }
  if (!Array.isArray(courseList)) {
    alert('No courses loaded!');
    return;
  }
  if (selectedCourses.length === 0) {
    alert('No courses selected!');
    return;
  }

  for (const id of selectedCourses) {
    try {
      courseData$.set({ ...courseData$.get(), [id]: -1 });
      const currentCourse: Course = courseList.find(
        (course: Course) => course.id === id,
      );
      const response = await fetchCourseData(id, apiKey);
      courseData$.set({ ...courseData$.get(), [id]: -2 });
      const courseAttribs = getCourseAttributes(currentCourse);
      const { courseNumber, deptCode } = splitCourseCode(
        courseAttribs.courseCode,
      );
      let bannerData = await getBannerData(
        courseAttribs.courseYear,
        courseAttribs.semester,
        deptCode,
        courseNumber,
      );
      if (typeof bannerData === 'string') {
        problemCourses$.set([
          ...problemCourses$.get(),
          `${courseAttribs.courseCode} ${courseAttribs.semester} ${courseAttribs.courseYear}`,
        ]);
        continue;
      }
      courseData$.set({ ...courseData$.get(), [id]: response.status });
    } catch (e) {
      console.log(e);
    }
  }
}
export default Home;
