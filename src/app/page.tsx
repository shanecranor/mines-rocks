/* eslint-disable @next/next/no-img-element */
import styles from './page.module.scss';
import Head from 'next/head';
import {
  getAssignmentGroups,
  getAssignments,
  getCourseListFiltered,
  getBannerData,
  getDbSize,
} from '@/services/database';
import SearchResults from '@/components/search/search-results/search-results';
import SearchBar from '@/components/search/search-bar/search-bar';
import FilterSettings from '@/components/search/search-settings/filter-settings';
import Navbar from '@/components/navbar/navbar';
import { SsgResults } from '@/components/search/ssg-results/ssg-results';

export const metadata = {
  title: 'mines.rocks: data driven course selection',
  description:
    'See grade distributions, assignment weights, and other historical data for your courses.',
};

export default async function Home() {
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
          {numAssignments} assignments uploaded! Contribute classes here:{' '}
          <a
            style={{
              color: '#0070f9',
              textDecoration: 'underline',
            }}
            href="/contribute"
          >
            contribute
          </a>
        </div>
        <SearchBar />
        <div className={styles['results-container']}>
          <FilterSettings />
          <div className={styles['search-results']}>
            <SsgResults />
          </div>
        </div>
      </main>
    </>
  );
}
