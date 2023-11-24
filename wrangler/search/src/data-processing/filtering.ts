import { BannerCourse, Course } from '../types/types';
import { ExtendedCourse } from './aggregation/aggregate-course-data';
import { getCourseAttributes, instructorsFromBanner } from './aggregation/util';

export function filterCourseList(courseList: ExtendedCourse[], searchOptions$: any) {
	const searchText = searchOptions$.get().searchText.toLowerCase();
	return courseList.filter((course: ExtendedCourse) => {
		const c = course;
		const bannerCourses = course.bannerCourses;
		//show partially completed courses?
		if (!searchOptions$.showPartialClasses.get()) {
			const uploadDate =
				c.upload_date === null
					? new Date('2023-11-01') //if upload date is null its bc the cf worker broke so we'll assume 2023
					: new Date(c.upload_date);
			if (c.end_at && new Date(c.end_at) > new Date(uploadDate)) return false;
		}
		const attributes = getCourseAttributes(c);
		const semesterKeys = Object.keys(searchOptions$.semester.get());
		const semesterValues = Object.values(searchOptions$.semester.get());
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

		if (c.name) {
			if (c.name.toLowerCase().includes(searchText)) {
				return true;
			}
		}
		if (bannerCourses) {
			//FIX ME
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
