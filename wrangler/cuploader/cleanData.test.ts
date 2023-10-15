import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { cleanRow } from "./cleanData";
const courseTableKeys = [
    "grading_standard_id",
    "created_at",
    "end_at",
    "apply_assignment_group_weights",
    "id",
    "start_at",
    "name",
    "time_zone",
    "friendly_name",
    "course_code",
];
const testCourseRow = {
    id: 32674,
    name: "WEB PROGRAMMING, Sec: A Fall 21",
    account_id: 393,
    uuid: "2AwCaOEw5VAs6zNReYtc4yT1J1jjyzB56CvS1HsY",
    start_at: "2021-08-23T07:01:00Z",
    grading_standard_id: 594,
    is_public: false,
    created_at: "2020-12-07T22:00:59Z",
    course_code: "Fall.2021.CSCI445A",
    default_view: "wiki",
    root_account_id: 1,
    enrollment_term_id: 159,
    license: "private",
    grade_passback_setting: null,
    end_at: null,
    public_syllabus: false,
    public_syllabus_to_auth: false,
    storage_quota_mb: 5000,
    is_public_to_auth_users: false,
    homeroom_course: false,
    course_color: null,
    friendly_name: null,
    apply_assignment_group_weights: true,
    calendar: {
        ics: "https://elearning.mines.edu/feeds/calendars/course_2AwCaOEw5VAs6zNReYtc4yT1J1jjyzB56CvS1HsY.ics",
    },
    time_zone: "America/Denver",
    blueprint: false,
    template: false,
    enrollments: [
        {
            type: "student",
            role: "StudentEnrollment",
            role_id: 3,
            user_id: 16750,
            enrollment_state: "active",
            limit_privileges_to_course_section: false,
        },
    ],
    hide_final_grades: false,
    workflow_state: "available",
    restrict_enrollments_to_course_dates: false,
    overridden_course_visibility: "",
};

describe("cleanRow", () => {
    it("clean row contrived", () => {
        const cleanedRow = cleanRow(testCourseRow, courseTableKeys)
        console.log(cleanedRow);
        console.log(typeof cleanedRow);
        //write asserts to check that the clean row contains every single key in the table keys and no other keys
        expect(cleanedRow).toBeDefined();
        //loop through the table keys and check for each key
        for (const key of courseTableKeys) {
            expect(cleanedRow[key]).toBeDefined();
        }
        //now check that there are no extra keys
        for (const key in cleanedRow) {
            expect(courseTableKeys).toContain(key);
        }
    });
});
