'use client';
import { observer } from '@legendapp/state/react';
import styles from './search-bar.module.scss';
import { searchOptions$ } from '../search-options';
const SearchBar = observer(() => {
  return (
    <div className={styles['search-container']}>
      <input
        type="text"
        placeholder="Search for a course"
        onChange={(e) => searchOptions$.searchText.set(e.target.value)}
      ></input>
    </div>
  );
});
export default SearchBar;
