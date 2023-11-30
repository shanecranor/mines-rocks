'use client';
import { observable } from '@legendapp/state';
export const sortOptions = [
  'Date',
  // "Dept",
  'Course Number',
  'Course Name',
  // "Has Banner Data?",
  // "Avg Grade",
  'Total Enrollment',
  'Total Sections',
] as const;
export type SortOptions = (typeof sortOptions)[number];

export const searchOptions$ = observable({
  searchText: '',
  semester: {
    spring: true,
    fall: true,
    summer: true,
  },
  showPartialClasses: false,
  showClassesWithoutScores: false,
  sortOptions: {
    allOptions: sortOptions,
    primarySort: 'Date',
    isPrimarySortReversed: false,
    secondarySort: 'Dept',
  },
});
