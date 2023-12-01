'use client';
import { observer } from '@legendapp/state/react';
import { searchOptions$ } from '../../search-options';
import { CourseSummaryData } from '@/components/course-component/summary-data/new-summary-data';
import NewCourseComponent from '@/components/course-component/new-course-component';
import { sortCourseList } from '../sort';
import { filterCourseList } from '../filter';
const NUM_RESULTS = 20;

/**
 * Renders the search results from the staticly fetched data
 * Search and filter options are applied client side
 * @param courses - The array of course summary data.
 * @returns The JSX element representing the search results.
 */
const SsgSearchResultsClient = observer(
  ({ courses }: { courses: CourseSummaryData[] }) => {
    const searchOptions = searchOptions$.get();
    const courseList = filterCourseList(courses, searchOptions);
    return (
      <>
        <div>
          Showing {Math.min(NUM_RESULTS, courseList.length)} out of{' '}
          {courseList.length} courses.
        </div>
        {sortCourseList(courseList, searchOptions)
          .splice(0, NUM_RESULTS)
          .map((c: CourseSummaryData) => {
            return <NewCourseComponent courseData={c} key={c.id} />;
          })}
      </>
    );
  },
);

export default SsgSearchResultsClient;
