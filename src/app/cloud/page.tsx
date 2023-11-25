/* eslint-disable @next/next/no-img-element */
import styles from './page.module.scss';

import {
  getAssignmentGroups,
  getAssignments,
  getCourseListFiltered,
  getBannerData,
  getDbSize,
} from '@/services/database';
import SearchResults, {
  buildBannerCourseMap,
} from '@/components/search/search-results/search-results';
import SearchBar from '@/components/search/search-bar/search-bar';
import FilterSettings from '@/components/search/search-settings/filter-settings';
import Navbar from '@/components/navbar/navbar';
import { CloudResults } from '@/components/search/cloud-results/cloud-results';
import { create } from 'domain';

export const metadata = {
  title: 'mines.rocks: data driven course selection',
  description:
    'See grade distributions, assignment weights, and other historical data for your courses.',
};

export default async function Home() {
  const numCourses = await getDbSize('course_summary_data');
  const numAssignments = await getDbSize('assignment_data');
  const bannerCourses = await getBannerData();
  const bannerCourseMap = buildBannerCourseMap(bannerCourses);
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
          <FilterSettings />
          <div className={styles['search-results']}>
            <CloudResults bannerCourseMap={bannerCourseMap} />
          </div>
        </div>
      </main>
    </>
  );
}
