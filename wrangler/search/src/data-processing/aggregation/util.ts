import { BannerCourse, isSeason } from '../../types/types';
import he from 'he';

export const getCourseAttributes = (dataString: string | null) => {
	if (!dataString) throw new Error('No course code found');
	// split on both . and space
	const dataList = dataString.split(/\.|\s/);
	const semester = dataList[0].replace('Sprg', 'Spring').replace('Smr', 'Summer');
	const courseYear = dataList[1];
	// find the first 3 digit number, then remove everything after it
	const courseCode = dataList[2].replace(/(\d{3}).*/, '$1');
	if (!isSeason(semester.toLowerCase())) throw new Error(`Invalid semester: ${semester} from ${dataString}`);
	//if this code lives long enough, we'll have to update this to support 5 digit years
	if (!courseYear.match(/\d{4}/)) throw new Error(`Invalid year: ${courseYear} from ${dataString}`);

	return {
		semester,
		courseCode,
		courseYear,
	};
};

export function getBannerCourseAttributes(bannerCourse: BannerCourse) {
	const searchInput = bannerCourse.searchInput;
	const courseCode = bannerCourse.subjectCourse;
	if (!courseCode) throw new Error(`No course code found for ${searchInput}`);
	const termDesc = bannerCourse.termDesc;
	const courseYear = termDesc?.split(' ')[1];
	if (!courseYear) throw new Error(`No year found in ${termDesc} for ${courseCode}`);
	const semester = termDesc?.split(' ')[0];
	if (!semester) throw new Error(`No semester found for ${courseCode}`);
	const courseName = bannerCourse.courseTitle;
	if (!courseName) throw new Error(`No course name found for ${courseCode}`);
	return { semester, courseCode, courseYear, courseName };
}

export function instructorsFromBanner(bannerCourses: BannerCourse[]): string[] {
	const instructorSet = new Set();
	for (const c of bannerCourses) {
		if (c.faculty === null || !Array.isArray(c.faculty)) continue;
		for (const instructor of c.faculty) {
			if (instructor === null || typeof instructor !== 'object' || !('displayName' in instructor)) continue;
			instructorSet.add(he.decode((instructor.displayName as string)?.split(') ')[1] || (instructor.displayName as string)));
		}
	}
	return Array.from(instructorSet) as string[];
}

export function getLabAndNonLabCourses(bannerCourses: BannerCourse[]) {
	const nonLabCourses: BannerCourse[] = bannerCourses.filter((c: BannerCourse) => c.scheduleTypeDescription != 'Lab');
	const labCourses: BannerCourse[] = bannerCourses.filter((c: BannerCourse) => c.scheduleTypeDescription == 'Lab');

	return { nonLabCourses, labCourses };
}

export function getEnrollment(nonLabCourses: BannerCourse[], labCourses: BannerCourse[]) {
	return (
		nonLabCourses.reduce((prev: number, curr: BannerCourse) => prev + (curr.enrollment || 0), 0) ||
		labCourses.reduce((prev: number, curr: BannerCourse) => prev + (curr.enrollment || 0), 0)
	);
}

export const splitCourseCode = (code: string) => {
	const courseNumber = code.slice(-3);
	const deptCode = code.slice(0, -3);
	return { deptCode, courseNumber };
};
