import { RouterObj } from "./types";
export const router = <RouterObj>{
  getCourses: [
    {
      endpointName: "courses",
      endpoint: "api/v1/courses?per_page=1000",
      supabaseTable: "course_summary_data",
      requiredKeys: ["id", "name"],
      uploadData: false,
    },
  ],
  getCourseData: [
    {
      endpointName: "course",
      endpoint: "api/v1/courses/course_id",
      params: ["course_id"],
      supabaseTable: "course_summary_data",
      uploadData: true,
      requiredKeys: ["id", "name"],
    },
    {
      endpointName: "assignment_groups",
      endpoint: "api/v1/courses/course_id/assignment_groups",
      params: ["course_id"],
      supabaseTable: "assignment_group_data",
      uploadData: true,
    },
    {
      endpointName: "assignments",
      //we don't store the submission but need to include for some reason so that canvas sends us the score statistics
      endpoint:
        "api/v1/courses/course_id/assignments?per_page=1000&include[]=score_statistics&include[]=submission",
      params: ["course_id"],
      supabaseTable: "assignment_data",
      uploadData: true,
      dontOverwriteIfNull: ["score_statistics"],
      //TODO: add required keys
    },
  ],
};
