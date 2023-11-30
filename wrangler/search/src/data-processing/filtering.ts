import { BannerCourse, Course } from '../types/types';
import { ExtendedCourse } from './aggregation/aggregate-course-data';
import { getCourseAttributes, instructorsFromBanner } from './aggregation/util';

export type SearchOptions = {
	searchText: string;
	showPartialClasses: boolean;
	semester: { [key: string]: boolean };
	sortOptions: {
		primarySort: string;
		isPrimarySortReversed: boolean;
	};
};
export function filterCourseList(courseList: ExtendedCourse[], searchOptions: SearchOptions) {
	const searchText = searchOptions.searchText.toLowerCase();
	return courseList.filter((course: ExtendedCourse) => {
		if (isIgnoredCourse(course.name)) return false;
		if (!searchOptions.showPartialClasses) {
			const uploadDate =
				course.upload_date === null
					? new Date('2023-11-01') //if upload date is null its bc the cf worker broke so we'll assume 2023
					: new Date(course.upload_date);
			if (course.end_at && new Date(course.end_at) > new Date(uploadDate)) return false;
		}

		const attributes = course.attributes;
		const semesterKeys = Object.keys(searchOptions.semester);
		const semesterValues = Object.values(searchOptions.semester);
		const isSemesterMatch = semesterKeys.some((key, index) => {
			if (semesterValues[index]) {
				if (attributes && attributes.semester.toLowerCase().includes(key)) {
					return true;
				}
			}
		});
		if (!isSemesterMatch) {
			return false;
		}

		if (course.searchString && course.searchString.includes(searchText)) return true;

		return false;
	});
}
const isIgnoredCourse = (courseName: string) => {
	return IGNORE_CLASSES.some((ignoredClass) => courseName.includes(ignoredClass));
};
const IGNORE_CLASSES = [
	'Canvas API project course',
	'CASA Advising',
	'Sandbox - ',
	'SANS Security Awareness Course',
	'Tutoring',
	'Operation Oredigger',
	'Makerspace Training Portal',
	'Computer Science Student Portal',
	'Undergraduate Commencement',
	'Graduate Commencement',
	'Portal',
	'Physical Metallurgy Laboratory',
	'SAIL',
	'BSO',
	'Reservations',
	'Check-Out',
	'Online Launch Orientation',
	'Weaver Towers',
	'Spruce Hall',
	'eLearning Template',
	'Guide to Online Learning',
	'AMS Communications Students',
	'Mines Park Apartments',
	'Chem Lab Team',
	'Core Review',
];
