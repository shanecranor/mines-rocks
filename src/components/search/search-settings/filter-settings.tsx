'use client';
import { searchOptions$, sortOptions } from '../search-options';
import Checkbox from '@/components/form-components/checkbox';
import Dropdown from '@/components/form-components/dropdown';
import styles from './filter-settings.module.scss';
import { observer } from '@legendapp/state/react';
const FilterSettings = observer(() => {
  return (
    <aside className={styles['filter-settings']}>
      {/* <h3>Search Settings:</h3> */}
      <form>
        <fieldset>
          {/* <legend>Sort</legend> */}
          <div className={styles['setting-group']}>
            <label>
              Sort by{' '}
              <Dropdown
                options={sortOptions}
                state$={searchOptions$.sortOptions.primarySort}
              />{' '}
            </label>
            <button onClick={(e) => reversePrimarySort(e)}>
              {searchOptions$.sortOptions.isPrimarySortReversed.get()
                ? '↑'
                : '↓'}
            </button>
            {/* <label>Secondary Sort <Dropdown options={sortOptions} state$={searchOptions$.sortOptions.secondarySort} /> </label> */}
          </div>
        </fieldset>
        <fieldset>
          {/* <legend>Semester Filter</legend> */}
          <div className={styles['setting-group']}>
            <Checkbox label="Spring" state$={searchOptions$.semester.spring} />
            <Checkbox label="Fall" state$={searchOptions$.semester.fall} />
            <Checkbox label="Summer" state$={searchOptions$.semester.summer} />
          </div>
        </fieldset>
        <fieldset>
          <div className={styles['setting-group']}>
            <Checkbox
              label="Show incomplete?"
              state$={searchOptions$.showPartialClasses}
            />
          </div>
        </fieldset>
      </form>
    </aside>
  );
});
export default FilterSettings;

function reversePrimarySort(
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
) {
  e.preventDefault();
  searchOptions$.sortOptions.isPrimarySortReversed.set(
    !searchOptions$.sortOptions.isPrimarySortReversed.get(),
  );
}
