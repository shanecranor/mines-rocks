import { CourseAttributes } from "@/services/data-aggregation";
import BoxPlot from "./box-plot";
import styles from "./course-component.module.scss";
import { GradeStatistics } from "@/services/database";

export const SummaryData = ({
  courseCode,
  semester,
  courseYear,
  avgStats,
}: any) => {
  // TODO fix types, should also have avg stats: gradeStatistics
  return (
    <div className={styles["small-view"]}>
      <div className={styles["course-attributes"]}>
        <div className={styles.code}>{Math.random() > 0.5 ? "Principles of Programming Languages" : "Data Structures"}
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
