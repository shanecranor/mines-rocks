import { BannerCourse, Course } from '../../types/types';
import { getBannerCourseAttributes, getCourseAttributes, instructorsFromBanner } from './util';
import he from 'he';
export type ExtendedCourse = Course & ExtProps;
export type ExtProps = {
	name: string;
	searchString: string;
	instructors?: string[];
	creditHours?: string;
	numSections?: number;
	courseTypes?: string[];
	enrollment?: number;
	attributes: {
		semester: string;
		courseCode: string;
		courseYear: string;
	};
};

export function aggregateCourseData(canvasCourses: Course[], bannerCourses: BannerCourse[]): ExtendedCourse[] {
	const extendedCourses: ExtendedCourse[] = [];
	const bannerMap = buildBannerCourseMap(bannerCourses);
	for (const course of canvasCourses) {
		try {
			const { semester, courseCode, courseYear } = getCourseAttributes(course.course_code);
			const matchingBannerCourses = getMatchingBannerCourses(course, bannerMap);
			if (matchingBannerCourses.length === 0) {
				// If there are no matching banner courses, we can't get more data
				const name = cleanCourseName(course.name);
				const extProps: ExtProps = {
					name,
					attributes: { semester, courseCode, courseYear },
					searchString: `${name} | ${courseCode}`.toLowerCase(),
				};
				const extCourse: ExtendedCourse = Object.assign(course, extProps);
				extendedCourses.push(extCourse);
			} else {
				// If there are banner courses, lets get more stuff!
				const instructors = instructorsFromBanner(matchingBannerCourses);
				const bannerCourseName = matchingBannerCourses[0].courseTitle;
				const { nonLabCourses, labCourses } = getLabAndNonLabCourses(matchingBannerCourses);
				const name = he.decode(bannerCourseName || '') || cleanCourseName(course.name);
				const extProps: ExtProps = {
					name,
					attributes: { semester, courseCode, courseYear },
					searchString: `${name} | ${courseCode} | ${instructors.join(' | ')}`.toLowerCase(),
					instructors,
					creditHours: getCreditHours(matchingBannerCourses),
					numSections: nonLabCourses.length || labCourses.length,
					courseTypes: Array.from(new Set(matchingBannerCourses.map((c: BannerCourse) => String(c.scheduleTypeDescription)))),
					enrollment: getEnrollment(nonLabCourses, labCourses),
				};
				const extCourse: ExtendedCourse = Object.assign(course, extProps);
				extendedCourses.push(extCourse);
			}
		} catch (e) {}
	}
	return extendedCourses;
}
function getCreditHours(bannerCourses: BannerCourse[]) {
	const creditHoursLow = bannerCourses[0]?.creditHourLow;
	const creditHoursHigh = bannerCourses[0]?.creditHourHigh;
	const creditHoursString = creditHoursLow && creditHoursHigh ? `${creditHoursLow}-${creditHoursHigh}` : creditHoursLow || creditHoursHigh;
	return String(creditHoursString);
}
export function cleanCourseName(name: string | null) {
	if (!name) return 'no course name found';
	const courseNameSuffixes = [
		', Sec',
		'-Fall',
		'-Spring',
		'-Summer',
		' (SC',
		', Sprg',
		' Summer ',
		', Fall',
		', Spring',
		', Summer',
		' (CH',
	];
	return courseNameSuffixes.reduce((prev, curr) => prev.split(curr)[0], name);
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

export function getMatchingBannerCourses(course: Course, bannerMap: Map<string, BannerCourse[]>) {
	const canvasAtribs = getCourseAttributes(course.course_code);
	const key = `${canvasAtribs.courseCode}-${canvasAtribs.semester}-${canvasAtribs.courseYear}`.toLowerCase(); // Consistent with map key formatting
	return bannerMap.get(key) || [];
}

export function getLabAndNonLabCourses(bannerCourses: BannerCourse[]) {
	const nonLabCourses: BannerCourse[] = bannerCourses.filter((c: BannerCourse) => c.scheduleTypeDescription != 'Lab');
	const labCourses: BannerCourse[] = bannerCourses.filter((c: BannerCourse) => c.scheduleTypeDescription == 'Lab');

	return { nonLabCourses, labCourses };
}
function getEnrollment(nonLabCourses: BannerCourse[], labCourses: BannerCourse[]) {
	return (
		nonLabCourses.reduce((prev: number, curr: BannerCourse) => prev + (curr.enrollment || 0), 0) ||
		labCourses.reduce((prev: number, curr: BannerCourse) => prev + (curr.enrollment || 0), 0)
	);
}
