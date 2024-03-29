/* eslint-disable @next/next/no-img-element */
import styles from './page.module.scss';

import { getDbSize } from '@/services/database';
import SearchBar from '@/components/search/search-bar/search-bar';
import FilterSettings from '@/components/search/search-settings/filter-settings';
import Navbar from '@/components/navbar/navbar';
import { CloudResults } from '@/components/search/search-results/cloud-results/cloud-results';

export const metadata = {
  title: 'mines.rocks: data driven course selection',
  description:
    'See grade distributions, assignment weights, and other historical data for your courses.',
};

export default async function Home() {
  const numCourses = await getDbSize('course_summary_data');
  const numAssignments = await getDbSize('assignment_data');
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles['heading-container']}>
          <img src="logo4.png" className={styles['logo']} alt="Logo" />
          <h1>
            Data driven course selection <i>rocks</i>
          </h1>
        </div>
        <div className={styles['flavor-text']}>
          Database size: {numAssignments} assignments and {numCourses} classes!
        </div>
        <SearchBar />
        <div className={styles['results-container']}>
          {/* <FilterSettings /> */}
          {/* This is commented out because it isn't fully implemented yet */}
          <div className={styles['search-results']}>
            <CloudResults />
          </div>
        </div>
      </main>
    </>
  );
}
