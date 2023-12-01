'use client';
import { Observable, isArray } from '@legendapp/state';
import { observer, useObservable } from '@legendapp/state/react';
import { searchOptions$ } from '../../search-options';
import { useEffect, useState } from 'react';
import { BannerCourse, Course } from '@/services/database';
import {
  CourseSummaryData,
  NewSummaryData,
} from '@/components/course-component/summary-data/new-summary-data';
import NewCourseComponent from '@/components/course-component/new-course-component';
import styles from './search-results.module.scss';

async function performSearch() {
  console.log(searchOptions$.searchText.peek());
  const response = await fetch(
    `https://search.mines.rocks/?search=${searchOptions$.searchText.peek()}`,
  );
  return await response.json();
}
export const CloudResults = observer(() => {
  const [searchResults, setSearchResults] = useState([]);
  const timer$ = useObservable();
  useEffect(() => {
    const fetchData = async () => {
      if (timer$.get()) {
        clearTimeout(timer$.get() as number);
      }
      timer$.set(
        setTimeout(async () => {
          try {
            const results = await performSearch();
            setSearchResults(results);
          } catch (error) {
            console.error('Error fetching search results:', error);
          }
        }, 400),
      );
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOptions$.searchText.get()]);
  return (
    <div className={styles['results']}>
      {searchResults.map((r: CourseSummaryData) => (
        <NewCourseComponent courseData={r} key={r.id} />
      ))}
    </div>
  );
});
