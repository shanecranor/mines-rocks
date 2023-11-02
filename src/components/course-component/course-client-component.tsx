'use client';
import styles from './course-component.module.scss';
import { observer, useObservable } from '@legendapp/state/react';
import { Observable } from '@legendapp/state';
import { SummaryData } from './summary-data';
import { Assignment, Course } from '@/services/database';
import { GroupStat } from '@/services/data-aggregation';
import { group } from 'console';
import { GroupTable } from './group-table';

const CourseClientComponent = observer(
  ({
    summaryData,
    groupTableProps,
    expandedData,
  }: {
    summaryData: React.ReactNode;
    groupTableProps: any;
    expandedData: React.ReactNode;
  }) => {
    const isOpen$ = useObservable<boolean>(false);
    return (
      <>
        <div
          className={`${styles['course-component']}`}
          onClick={() => isOpen$.set(!isOpen$.peek())}
        >
          {/* All components with data will be rendered server side */}
          {summaryData}
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
              <GroupTable isOpen$={isOpen$} {...groupTableProps} />
              {expandedData}
            </div>
          </div>
        </div>
      </>
    );
  },
);
export default CourseClientComponent;
