import {
  GroupStat,
  getGroupColor,
  getGroupWeight,
} from '@/services/data-aggregation';
import styles from './group-table.module.scss';
import { IBM_EXPANDED_COLORS } from '@/utils/colors';
import { Observable } from '@legendapp/state';

function onHover(
  group: GroupStat,
  hoveredGroup$: Observable<number | null> | undefined,
) {
  if (!hoveredGroup$) return;
  hoveredGroup$.set(group.group.id);
}
function onClick(
  group: GroupStat,
  hoveredGroup$: Observable<number | null> | undefined,
) {
  if (!hoveredGroup$) return;
  hoveredGroup$.set(group.group.id);
}

function onLeave(hoveredGroup$: Observable<number | null> | undefined) {
  if (!hoveredGroup$) return;
  hoveredGroup$.set(null);
}

export const GroupTable = ({
  stats,
  totalWeight,
  isOpen$,
  hoveredGroup$,
}: {
  stats: GroupStat[];
  totalWeight: number;
  isOpen$: any;
  hoveredGroup$?: Observable<number | null>;
}) => {
  return (
    <div className={styles['table']}>
      <table>
        <thead>
          <tr className={styles['column-labels']}>
            <td className={styles['weight']}>Weight</td>
            <td className={styles['category']}>Category</td>
            <td className={styles['avg']}>Avg</td>
            <td className={styles['quantity']}>qty</td>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, idx) => {
            if (!stat.group.group_weight && !stat.stats.mean) return <></>;
            const isOpen = isOpen$.get();
            const groupWeight = getGroupWeight(stat, totalWeight);
            const transitionTime =
              typeof groupWeight === 'number' ? groupWeight / 90 : 0;
            const roundedGroupWeight =
              groupWeight === 'N/A' ? 'N/A' : Math.round(groupWeight);
            const transitionDelay = `${
              isOpen ? idx / 30 : (stats.length - idx) / 100
            }s`;
            return (
              <tr
                key={stat.group.id + 'table'}
                onMouseOver={() => onHover(stat, hoveredGroup$)}
                onMouseLeave={() => onLeave(hoveredGroup$)}
              >
                <td>
                  <span
                    className={styles['weight-color-block']}
                    style={{
                      background: getGroupColor(stat.group, stats.length),
                    }}
                  ></span>
                  {roundedGroupWeight}%
                  <div
                    className={styles['weight-bar']}
                    style={{
                      width: `${isOpen ? groupWeight : 0}%`,
                      background: getGroupColor(stat.group, stats.length),
                      transitionDelay,
                      transition: `width ${transitionTime}s ease-in-out`,
                    }}
                  />
                </td>
                <td>{stat.group.name}</td>
                <td>{Math.round(stat.stats.mean)}%</td>
                <td>{stat.numAssignments}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
