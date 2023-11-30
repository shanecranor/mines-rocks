'use client';
import {
  Assignment,
  AssignmentGroup,
  BannerCourse,
  Course,
  GradeStatistics,
  STAT_KEYS,
} from '@/services/database';
import styles from './course-component.module.scss';

import { observer, useObservable } from '@legendapp/state/react';
import {
  CourseSummaryData,
  NewSummaryData,
} from './summary-data/new-summary-data';
import { useQuery } from '@tanstack/react-query';
import { GroupTable } from './group-table/group-table';
import NewAssignmentGraph from './assignment-graph/new-assignment-graph';
import { GroupStat } from '@/services/data-aggregation';
interface CloudCourseStats {
  overallStats: {
    stats: GradeStatistics;
    totalWeight: number;
  };
  groupStats: GroupStat[];
}
async function getCourseStats(courseId: string | number) {
  const response = await fetch(
    `https://search.mines.rocks/stats/?courseId=${courseId}`,
  );
  return (await response.json()) as CloudCourseStats;
}
const NewCourseComponent = observer(
  ({ courseData }: { courseData: CourseSummaryData }) => {
    const courseId = courseData.id;
    const { isLoading, data: courseStats } = useQuery({
      queryKey: [`courseStats${courseId}`],
      queryFn: async () => await getCourseStats(courseId),
      //cache for 10 days
      staleTime: 1000 * 60 * 60 * 24 * 10,
    });
    const isOpen$ = useObservable<boolean>(false);
    return (
      <>
        <div
          className={`${styles['course-component']}`}
          onClick={() => isOpen$.set(!isOpen$.peek())}
        >
          <NewSummaryData
            courseId={courseId}
            courseData={courseData}
            mean={courseStats?.overallStats.stats.mean}
          />
          {/* TY to the goat https://css-tricks.com/author/chriscoyier/ for CSS Grid animations :) */}
          <div
            className={styles['big-view']}
            style={{ gridTemplateRows: isOpen$.get() ? '1fr' : '0fr' }}
          >
            <div
              className={styles['big-content']}
              style={{
                visibility: isOpen$.get() ? 'visible' : 'hidden',
              }}
            >
              <div className={styles['divider']} />
              {/* graphs and stuff go here */}
              {!isLoading && courseStats && (
                <>
                  <GroupTable
                    stats={courseStats?.groupStats}
                    totalWeight={Number(courseStats.overallStats.totalWeight)}
                    isOpen$={isOpen$}
                  />
                  {isOpen$.get() && (
                    <NewAssignmentGraph
                      courseData={courseData}
                      groupStats={courseStats.groupStats}
                      totalWeight={Number(courseStats.overallStats.totalWeight)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
);

export default NewCourseComponent;
