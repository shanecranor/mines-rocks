import {
  GroupStat,
  getGroupColor,
  getGroupWeight,
} from "@/services/data-aggregation";
import styles from "./course-component.module.scss";
export const GroupTable = ({
  stats,
  totalWeight,
  isOpen$,
}: {
  stats: GroupStat[];
  totalWeight: number;
  isOpen$: any;
}) => {
  return (
    <table>
      <thead>
        <tr className={styles["column-labels"]}>
          <td className={styles["weight"]}>Weight</td>
          <td className={styles["category"]}>Category</td>
          <td>Average</td>
        </tr>
      </thead>
      <tbody>
        {stats.map((stat, idx) => {
          if (!stat.group.group_weight && !stat.stats.mean) return <></>;
          const isOpen = isOpen$.get();
          const groupWeight = getGroupWeight(stat, totalWeight);
          const transitionTime =
            typeof groupWeight === "number" ? groupWeight / 90 : 0;
          const roundedGroupWeight =
            groupWeight === "N/A" ? "N/A" : Math.round(groupWeight);
          const transitionDelay = `${
            isOpen ? idx / 30 : (stats.length - idx) / 100
          }s`;
          return (
            <tr key={stat.group.id + "table"}>
              <td>
                {roundedGroupWeight}%
                <div
                  className={styles["weight-bar"]}
                  style={{
                    width: `${isOpen ? groupWeight : 0}%`,
                    background: getGroupColor(stat.group.id),
                    transitionDelay,
                    transition: `width ${transitionTime}s ease-in-out`,
                  }}
                />
              </td>
              <td>{stat.group.name}</td>
              <td>{Math.round(stat.stats.mean)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
