import { CourseAttributes } from "@/services/data-aggregation";
import BoxPlot from "./box-plot";
import styles from "./course-component.module.scss";
import { GradeStatistics } from "@/services/database";

export const SummaryData = ({
  courseCode,
  semester,
  courseYear,
  avgStats,
  bannerCourses
}: any) => {
  // TODO fix types, should also have avg stats: gradeStatistics
  let bannerCourseName = null;
  if (bannerCourses && bannerCourses[0]) {
    bannerCourseName = bannerCourses[0].courseTitle;
  }
  return (
    <div className={styles["small-view"]}>
      <div className={styles["course-attributes"]}>
        {/* fall back to course code if the banner course name isn't found */}
        {/* this is definitely the case for courses before 2021 because banner data doesn't go back that far */}
        <div className={styles.code}>{bannerCourseName || courseCode}
        </div>
        <span className={styles.when}>
          {semester} {courseYear}
        </span>
      </div>
      <div className={styles["course-data"]}>
        <div className={styles["course-data-text"]}>
          <div className={styles["data"]}>
            avg grade: {avgStats.mean?.toFixed(2)}%
          </div>
        </div>

        {/* {avgStats.mean ? (
          <BoxPlot stats={avgStats} />
        ) : (
          <div>no stats found</div>
        )} */}
      </div>
    </div>
  );
};
