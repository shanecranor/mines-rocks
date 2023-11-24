import { BannerCourse, Course } from '../../types/types';
import { getBannerCourseAttributes, getCourseAttributes, instructorsFromBanner } from './util';

export type ExtendedCourse = Course & {
	bannerCourses?: BannerCourse[];
	instructors?: string[];
};

export function aggregateCourseData(canvasCourses: Course[], bannerCourses: BannerCourse[]): ExtendedCourse[] {
	const extendedCourses: ExtendedCourse[] = [];
	const bannerMap = buildBannerCourseMap(bannerCourses);
	for (const course of canvasCourses) {
		try {
			getCourseAttributes(course);
			const matchingBannerCourses = getMatchingBannerCourses(course, bannerMap);
			(course as ExtendedCourse).bannerCourses = matchingBannerCourses;
			const instructors = instructorsFromBanner(matchingBannerCourses);
			(course as ExtendedCourse).instructors = instructors;
			extendedCourses.push(course);
		} catch (e) {}
	}
	return canvasCourses;
}

function buildBannerCourseMap(bannerData: BannerCourse[]): Map<string, BannerCourse[]> {
	const map = new Map<string, BannerCourse[]>();

	for (const bannerCourse of bannerData) {
		const attributes = getBannerCourseAttributes(bannerCourse);
		const key = `${attributes.courseCode}-${attributes.semester}-${attributes.courseYear}`.toLowerCase(); // Ensure consistent casing

		if (!map.has(key)) {
			map.set(key, []);
		}
		map.get(key)!.push(bannerCourse);
	}

	return map;
}

// Step 3: Modified getMatchingBannerCourses
function getMatchingBannerCourses(course: Course, bannerMap: Map<string, BannerCourse[]>) {
	const canvasAtribs = getCourseAttributes(course);
	const key = `${canvasAtribs.courseCode}-${canvasAtribs.semester}-${canvasAtribs.courseYear}`.toLowerCase(); // Consistent with map key formatting
	return bannerMap.get(key) || [];
}
