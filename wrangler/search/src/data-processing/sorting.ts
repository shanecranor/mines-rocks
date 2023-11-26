import { Course } from '../types/types';
import { ExtendedCourse } from './aggregation/aggregate-course-data';
import { getCourseAttributes, getEnrollment, getLabAndNonLabCourses, splitCourseCode } from './aggregation/util';
import { SearchOptions } from './filtering';

function getCourseDate(course: Course) {
	if (course.start_at !== null) return new Date(course.start_at);
	if (course.end_at !== null) return new Date(course.end_at);
	if (course.created_at !== null) return new Date(course.created_at);
	return new Date(0);
}

export function sortCourseList(courseList: any, searchOptions: SearchOptions) {
	const sortDirection = searchOptions.sortOptions.isPrimarySortReversed ? -1 : 1;
	return courseList.sort((a: ExtendedCourse, b: ExtendedCourse) => {
		const sortValue = searchOptions.sortOptions.primarySort;
		switch (sortValue) {
			case 'Date':
				const bTime = getCourseDate(b).getTime();
				const aTime = getCourseDate(a).getTime();
				return (bTime - aTime) * sortDirection;
			case 'Course Number':
				const { deptCode: aDeptCode, courseNumber: aCourseNum } = splitCourseCode(a.attributes.courseCode);
				const { deptCode: bDeptCode, courseNumber: bCourseNum } = splitCourseCode(b.attributes.courseCode);
				return (Number(bCourseNum) - Number(aCourseNum)) * sortDirection;
			case 'Course Name':
				if (a.name === null) return 1 * sortDirection;
				if (b.name === null) return -1 * sortDirection;
				return (
					b.name.localeCompare(a.name, undefined, {
						sensitivity: 'base',
					}) * sortDirection
				);
			//cases that need banner data, probably should refactor but this works for now
			// case 'Total Sections':
			// case 'Total Enrollment':
			// 	if (!a.bannerCourses || a.bannerCourses.length === 0) return 1 * sortDirection;
			// 	if (!b.bannerCourses || b.bannerCourses.length === 0) return -1 * sortDirection;
			// 	const { nonLabCourses: aNonLabCourses, labCourses: aLabCourses } = getLabAndNonLabCourses(a.bannerCourses);
			// 	const { nonLabCourses: bNonLabCourses, labCourses: bLabCourses } = getLabAndNonLabCourses(b.bannerCourses);
			// 	if (sortValue === 'Total Sections') {
			// 		const aSections = aNonLabCourses.length || aLabCourses.length;
			// 		const bSections = bNonLabCourses.length || bLabCourses.length;
			// 		return (bSections - aSections) * sortDirection;
			// 	} else if (sortValue === 'Total Enrollment') {
			// 		const aEnrollment = getEnrollment(aNonLabCourses, aLabCourses);
			// 		const bEnrollment = getEnrollment(bNonLabCourses, bLabCourses);
			// 		return (bEnrollment - aEnrollment) * sortDirection;
			// 	}
		}
	});
}
