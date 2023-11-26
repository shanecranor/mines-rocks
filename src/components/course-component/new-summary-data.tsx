/* eslint-disable @next/next/no-img-element */
import {
  CourseAttributes,
  getCourseAttributes,
} from '@/services/data-aggregation';
import BoxPlot from './box-plot';
import styles from './course-component.module.scss';
import {
  BannerCourse,
  Course,
  GradeStatistics,
  getCourseById,
} from '@/services/database';
import {
  cleanCourseName,
  getEnrollment,
  getLabAndNonLabCourses,
  instructorsFromBanner,
} from '@/services/info-aggregation';
import { useQuery } from '@tanstack/react-query';
export type CourseSummaryData = {
  name: string;
  id: string;
  attributes: {
    courseCode: string;
    semester: string;
    courseYear: string;
  };
  upload_date: string | null;
  start_at: string | null;
  end_at: string | null;
  instructors?: string[];
  creditHours?: string;
  numSections?: number;
  courseType?: string[];
  enrollment?: number;
};

export const NewSummaryData = ({
  courseId,
  courseData,
}: // courseSummaryData,
{
  courseId: string | number;
  courseData: CourseSummaryData;
}) => {
  // TODO fix types, should also have avg stats: gradeStatistics
  // const { isLoading, data: course } = useQuery({
  //   queryKey: [`course${courseId}`],
  //   queryFn: async () => await getCourseById(String(courseId)),
  // });

  // if (isLoading) {
  //   return <>loading {courseId}</>;
  // }
  // if (!course) return <>no course found</>;

  const { semester, courseCode, courseYear } = courseData.attributes;
  const {
    name,
    creditHours,
    numSections,
    courseType,
    instructors,
    enrollment,
  } = courseData;

  return (
    <div className={styles['small-view']}>
      <div className={styles['course-attributes']}>
        {/* fall back to course code if the banner course name isn't found */}
        {/* this is definitely the case for courses before 2021 because banner data doesn't go back that far */}
        <div className={styles.code}>{name}</div>
        <span className={styles['extra-info']}>
          <span>{courseCode}</span>
          <span className={styles.divider}>{' • '}</span>
          <span>
            {semester} {courseYear}
          </span>

          <span>
            {creditHours && (
              <>
                <span className={styles.divider}>{' • '}</span>
                <span>
                  <strong>{creditHours}</strong> credits
                </span>
              </>
            )}
          </span>
        </span>
      </div>
      <div className={styles['course-info']}>
        {
          // avgStats.mean && (
          //   <div className={styles['stat-chip']}>
          //     avg: <strong>{avgStats.mean?.toFixed(2)}%</strong>
          //     <div className={styles['tooltip']}>
          //       Average grade for all recorded assignments weighted by assignment
          //       group
          //     </div>
          //     {/* TODO: ADD ERROR RATE */}
          //   </div>)
        }
        {numSections && (
          <>
            <div className={styles['stat-chip']}>
              {numSections} {numSections == 1 ? 'section' : 'sections'}
            </div>
            {courseType && (
              <div className={styles['stat-chip']}>
                {courseType.join(' & ')}
              </div>
            )}
            {instructors && instructors.length == 1 && (
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
