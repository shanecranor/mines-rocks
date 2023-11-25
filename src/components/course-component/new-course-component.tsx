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
import { NewSummaryData } from './new-summary-data';

const NewCourseComponent = observer(
  ({
    courseId,
    bannerCourseMap,
  }: {
    courseId: string | number;
    bannerCourseMap: any;
  }) => {
    const isOpen$ = useObservable<boolean>(false);
    return (
      <>
        <div
          className={`${styles['course-component']}`}
          onClick={() => isOpen$.set(!isOpen$.peek())}
        >
          <NewSummaryData
            courseId={courseId}
            bannerCourseMap={bannerCourseMap}
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
            </div>
          </div>
        </div>
      </>
    );
  },
);

export default NewCourseComponent;
