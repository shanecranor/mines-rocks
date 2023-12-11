/* eslint-disable @next/next/no-img-element */
import styles from './page.module.scss';
import { getDbSize } from '@/services/database';
import SearchBar from '@/components/search/search-bar/search-bar';
import FilterSettings from '@/components/search/search-settings/filter-settings';
import Navbar from '@/components/navbar/navbar';
import { SsgResults } from '@/components/search/search-results/ssg-results/ssg-results';
import { SsgFakeResults } from '@/components/search/search-results/ssg-results/performance-testing/ssg-fake-results';

export const metadata = {
  title: 'mines.rocks: data driven course selection',
  description:
    'See grade distributions, assignment weights, and other historical data for your courses.',
};

const ENABLED = false;
export async function generateStaticParams() {
  if (!ENABLED) {
    return [{ size: '0' }];
  }
  const out = [];
  for (let i = 1; i < 25; i++) {
    out.push({
      size: String(i * 40),
    });
  }
  return out;
}

export default async function Home({ params }: any) {
  if (!ENABLED) {
    return <></>;
  }
  const { size } = params;
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
            <SsgFakeResults numCourses={Number(size)} />
          </div>
        </div>
      </main>
    </>
  );
}
