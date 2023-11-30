'use client';
import type { NextPage } from 'next';
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

type StatusString =
  | 'Success'
  | 'Uploading Canvas'
  | 'Uploading Banner'
  | 'Error uploading Canvas'
  | 'Error uploading Banner'
  | 'Error'
  | '';
const LOCAL_ENV = false;
function API_URL(route: string, key?: string) {
  const url = LOCAL_ENV
    ? 'http://localhost:8787'
    : 'https://cuploader.shanecranor.workers.dev';
  if (key === undefined) return `${url}/?route=${route}`;
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
  const response = await fetch(`${API_URL('getCourseData')}&course_id=${id}`, {
    headers: {
      'x-token': `Bearer ${key}`,
    },
  });
  const data = await response.json();
  return { data: data, status: response.status };
}

async function fetchCourseList(key?: string) {
  const response = await fetch(`${API_URL('getCourses')}`, {
    headers: {
      'x-token': `Bearer ${key}`,
    },
  });
  const data = await response.json();
  return data.courses || data;
}
const Home: NextPage = observer(() => {
  const hasConsented$ = useObservable(false);
  const courseList$ = useObservable<Course[] | string>('no courses loaded');
  const selectedCourses$ = useObservable<number[]>([]);
  const courseData$ = useObservable<any>([]);
  const courseList = courseList$.get();
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
      <Navbar />
      {!hasConsented$.get() && (
        <ConsentForm onSubmit={() => hasConsented$.set(true)} />
      )}
      {hasConsented$.get() && (
        <main className={styles.main}>
          <Instructions></Instructions>
          {Array.isArray(courseList) && (
            <>
              <h1>Courses to be uploaded:</h1>
              <p>
                Below is a table including all the Canvas courses that were able
                to be retrieved. Only courses with a check mark next to them
                will be uploaded. You can deselect any courses that you
                don&apos;t want to upload.
              </p>
              <br></br>
              <p id="instructions">
                To start the upload, click &ldquo;Contribute selected
                courses&rdquo;. If you have a lot of courses, this might take a
                while. <strong>DO NOT</strong> close this window during the
                upload process or the upload will not complete. <br></br>{' '}
                <br></br>
                Note: your courses will not show up immediately after uploading.
                It may take anywhere from an hour to a day for the site to
                update. <br></br>
                <br></br>
              </p>
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
                            <td>{courseData$.get()[course.id] || ''}</td>
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
                            <td>{courseData$.get()[course.id] || ''}</td>
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
            </>
          )}
          <br></br>
          <form onSubmit={(e) => e.preventDefault()}>
            <label>
              Paste your Canvas API key in this text box <br></br>
              <input
                type="text"
                value={apiKey$.get()}
                onChange={(e) => {
                  apiKey$.set(e.target.value);
                  //only store the key if we are in development mode, this isn't super secure so not ideal for prod
                  if (process && process.env.NODE_ENV === 'development')
                    localStorage.setItem('API_KEY', e.target.value);
                }}
              ></input>
            </label>
            <button //TODO: move this to its own function
              disabled={apiKey$.get().length === 0}
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
              disabled={selectedCourses$.get().length === 0}
              onClick={() =>
                uploadCourses(
                  courseList$,
                  selectedCourses$,
                  apiKey$,
                  courseData$,
                )
              }
            >
              Contribute selected courses!
            </button>
          </form>
        </main>
      )}
    </>
  );
});

function getCourseColor(isSelected: boolean, statusString: StatusString) {
  //create a status string map that maps status strings to colors
  const statusStringMap: Record<StatusString, string> = {
    Success: 'green',
    'Uploading Canvas': 'lightsteelblue',
    'Uploading Banner': 'steelblue',
    'Error uploading Canvas': 'red',
    'Error uploading Banner': 'red',
    '': '#101010',
    Error: 'red',
  };
  return statusStringMap[statusString];
}

async function uploadCourses(
  courseList$: any,
  selectedCourses$: any,
  apiKey$: any,
  courseData$: any,
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
  if (document !== null) {
    document
      .getElementById('instructions')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  for (const id of selectedCourses) {
    try {
      let statusString: StatusString = 'Uploading Canvas';
      courseData$.set({ ...courseData$.get(), [id]: statusString });
      const currentCourse: Course = courseList.find(
        (course: Course) => course.id === id,
      );
      const response = await fetchCourseData(id, apiKey);
      statusString = 'Uploading Banner';
      courseData$.set({ ...courseData$.get(), [id]: statusString });
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
        statusString = 'Error uploading Banner';
        courseData$.set({ ...courseData$.get(), [id]: statusString });
      }
      courseData$.set({
        ...courseData$.get(),
        [id]: response.status === 200 ? 'Success' : 'Error',
      });
    } catch (e) {
      console.log(e);
    }
  }
}
export default Home;
