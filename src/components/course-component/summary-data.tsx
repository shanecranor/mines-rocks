/* eslint-disable @next/next/no-img-element */
import { CourseAttributes } from '@/services/data-aggregation';
import BoxPlot from './box-plot';
import styles from './course-component.module.scss';
import { BannerCourse, Course, GradeStatistics } from '@/services/database';
import {
  getEnrollment,
  getLabAndNonLabCourses,
  instructorsFromBanner,
} from '@/services/info-aggregation';

export const SummaryData = ({
  course,
  courseCode,
  semester,
  courseYear,
  avgStats,
  bannerCourses,
}: {
  course: Course;
  courseCode: any;
  courseYear: any;
  semester: any;
  avgStats: any;
  bannerCourses: BannerCourse[];
}) => {
  // TODO fix types, should also have avg stats: gradeStatistics
  let bannerCourseName = null;
  if (bannerCourses && bannerCourses[0]) {
    bannerCourseName = bannerCourses[0].courseTitle;
  }
  //set number of section to the number of banner courses that are not labs (unless it is just a lab)
  const { nonLabCourses, labCourses } = getLabAndNonLabCourses(bannerCourses);
  const numSections = nonLabCourses.length || labCourses.length;
  const creditHoursLow = nonLabCourses[0]?.creditHourLow;
  const creditHoursHigh = nonLabCourses[0]?.creditHourHigh;
  const creditHoursString =
    creditHoursLow && creditHoursHigh
      ? `${creditHoursLow}-${creditHoursHigh}`
      : creditHoursLow || creditHoursHigh;
  const enrollment = getEnrollment(nonLabCourses, labCourses);
  const courseType = Array.from(
    new Set(bannerCourses.map((c: BannerCourse) => c.scheduleTypeDescription)),
  );
  const instructors = instructorsFromBanner(bannerCourses);
  function cleanCourseName(name: string | null) {
    if (!name) return 'no course name found';
    const courseNameSuffixes = [
      ', Sec',
      '-Fall',
      '-Spring',
      '-Summer',
      ' (SC',
      ', Sprg',
      ' Summer ',
      ', Fall',
      ', Spring',
      ', Summer',
      ' (CH',
    ];
    return courseNameSuffixes.reduce((prev, curr) => prev.split(curr)[0], name);
  }
  const courseDisplayName = bannerCourseName || cleanCourseName(course.name);
  return (
    <div className={styles['small-view']}>
      <div className={styles['course-attributes']}>
        {/* fall back to course code if the banner course name isn't found */}
        {/* this is definitely the case for courses before 2021 because banner data doesn't go back that far */}
        <div className={styles.code}>{courseDisplayName}</div>
        <span className={styles['extra-info']}>
          <span>{courseCode}</span>
          <span className={styles.divider}>{' • '}</span>
          <span>
            {semester} {courseYear}
          </span>

          <span>
            {creditHoursString && (
              <>
                <span className={styles.divider}>{' • '}</span>
                <span>
                  <strong>{creditHoursString}</strong> credits
                </span>
              </>
            )}
          </span>
        </span>
      </div>
      <div className={styles['course-info']}>
        {avgStats.mean && (
          <div className={styles['stat-chip']}>
            avg: <strong>{avgStats.mean?.toFixed(2)}%</strong>
            <div className={styles['tooltip']}>
              Average grade for all recorded assignments weighted by assignment
              group
            </div>
            {/* TODO: ADD ERROR RATE */}
          </div>
        )}
        {bannerCourses.length != 0 && (
          <>
            <div className={styles['stat-chip']}>
              {numSections} {numSections == 1 ? 'section' : 'sections'}
            </div>
            <div className={styles['stat-chip']}>{courseType.join(' & ')}</div>
            {instructors.length == 1 && (
              <div className={styles['stat-chip']}>
                Instructor: {instructors[0] as string}
              </div>
            )}
            <div className={styles['stat-chip']}>
              <strong>{enrollment}</strong>{' '}
              <img
                src="enrollments.svg"
                alt="enrolled students"
                width="14px"
                style={{ filter: 'invert()' }}
              />
              <div className={styles['tooltip']}>
                Number of enrolled students in all sections
              </div>
            </div>
          </>
        )}

        {/* {avgStats.mean ? (
          <BoxPlot stats={avgStats} />
        ) : (
          <div>no stats found</div>
        )} */}
      </div>
    </div>
  );
};
