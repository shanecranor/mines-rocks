import { RouterObj } from "./types";
export const router = <RouterObj>{
    getCourses: [{
        endpointName: "courses",
        endpoint: "api/v1/courses?per_page=1000",
        supabaseTable: "course_summary_data",
        requiredKeys: ["id", "name"]
    }],
    getCourseData: [
        {
            endpointName: "assignment_groups",
            endpoint: "api/v1/courses/course_id/assignment_groups",
            params: ["course_id"],
            supabaseTable: "assignment_group_data",
            //TODO: add required keys
        },
        {
            endpointName: "assignments",
            endpoint: "api/v1/courses/course_id/assignments?per_page=1000&include[]=score_statistics",
            params: ["course_id"],
            supabaseTable: "assignment_data"
            //TODO: add required keys
        },
    ],
}