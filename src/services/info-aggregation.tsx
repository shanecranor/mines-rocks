import { BannerCourse } from "./database";

export function instructorsFromBanner(bannerCourses: BannerCourse[]): string[] {
    const instructorSet = new Set();
    for (const c of bannerCourses) {
        if (c.faculty === null || !Array.isArray(c.faculty)) continue;
        for (const instructor of c.faculty) {
            if (instructor === null || typeof instructor !== "object" || !("displayName" in instructor)) continue;
            instructorSet.add((instructor.displayName as string)?.split(") ")[1] || instructor.displayName);
        }
    }
    return Array.from(instructorSet) as string[];
}



export function getLabAndNonLabCourses(bannerCourses: BannerCourse[]) {
    const nonLabCourses: BannerCourse[] = bannerCourses.filter(
        (c: BannerCourse) => c.scheduleTypeDescription != "Lab"
    );
    const labCourses: BannerCourse[] = bannerCourses.filter(
        (c: BannerCourse) => c.scheduleTypeDescription == "Lab"
    );

    return { nonLabCourses, labCourses }
}

export function getEnrollment(nonLabCourses: BannerCourse[], labCourses: BannerCourse[]) {
    return nonLabCourses.reduce(
        (prev: number, curr: BannerCourse) => prev + (curr.enrollment || 0),
        0
    ) || labCourses.reduce(
        (prev: number, curr: BannerCourse) => prev + (curr.enrollment || 0),
        0
    );
}