import { BannerCourse, Course } from '../types/types';
import { ExtendedCourse } from './aggregation/aggregate-course-data';
import { getCourseAttributes, instructorsFromBanner } from './aggregation/util';

export type SearchOptions = {
	searchText: string;
	showPartialClasses: boolean;
	semester: { [key: string]: boolean };
};
export function filterCourseList(courseList: ExtendedCourse[], searchOptions: SearchOptions) {
	const searchText = searchOptions.searchText.toLowerCase();
	return courseList.filter((course: ExtendedCourse) => {
		const bannerCourses = course.bannerCourses;
		//show partially completed courses?
		if (!searchOptions.showPartialClasses) {
			const uploadDate =
				course.upload_date === null
					? new Date('2023-11-01') //if upload date is null its bc the cf worker broke so we'll assume 2023
					: new Date(course.upload_date);
			if (course.end_at && new Date(course.end_at) > new Date(uploadDate)) return false;
		}
		const attributes = getCourseAttributes(course);
		const semesterKeys = Object.keys(searchOptions.semester);
		const semesterValues = Object.values(searchOptions.semester);
		const isSemesterMatch = semesterKeys.some((key, index) => {
			if (semesterValues[index]) {
				if (attributes.semester.toLowerCase().includes(key)) {
					return true;
				}
			}
		});
		//exit if semester filter doesn't match
		if (!isSemesterMatch) {
			return false;
		}

		if (attributes.courseCode.toLowerCase().includes(searchText)) {
			return true;
		}

		if (course.name) {
			if (course.name.toLowerCase().includes(searchText)) {
				return true;
			}
		}
		if (bannerCourses) {
			const instructors = instructorsFromBanner(bannerCourses);
			for (const instructor of instructors) {
				if (instructor.toLowerCase().includes(searchText)) {
					return true;
				}
			}
			let bannerCourseName = null;
			if (bannerCourses && bannerCourses[0]) {
				bannerCourseName = bannerCourses[0].courseTitle;
			}
			if (bannerCourseName && bannerCourseName.toLowerCase().includes(searchText)) {
				return true;
			}
		}

		return false;
	});
}
