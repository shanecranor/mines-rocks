"use client";
import { searchOptions$ } from "../search-options";
import Checkbox from "@/components/form-components/checkbox";
import styles from "./filter-settings.module.scss";
const FilterSettings = () => {
  return (
    <aside className={styles["filter-settings"]}>
      <div>Semester</div>
      <Checkbox label="Spring" state$={searchOptions$.semester.spring} />
      <Checkbox label="Fall" state$={searchOptions$.semester.fall} />
      <Checkbox label="Summer" state$={searchOptions$.semester.summer} />
      {/* Sort:
              <div>Course Code</div>
              <div>Average</div>
              <div>Theoretical Min</div>
              <div>Theoretical Max</div> */}
    </aside>
  );
};
export default FilterSettings;
