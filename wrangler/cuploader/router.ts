import { RouterObj } from "./types";
export const router = <RouterObj>{
  getCourses: [
    {
      endpointName: "courses",
      endpoint: "api/v1/courses?per_page=1000",
      supabaseTable: "course_summary_data",
      requiredKeys: ["id", "name"],
    },
  ],
  getCourseData: [
    {
      //fine to upsert everything
      endpointName: "assignment_groups",
      endpoint: "api/v1/courses/course_id/assignment_groups",
      params: ["course_id"],
      supabaseTable: "assignment_group_data",
      //TODO: add required keys
    },
    {
      //not fine to upsert everything
      //todo: add a key to the table that represents the values that we should not overwrite
      //for example, if one person uploads a class and submits an assignment so we can see the score breakdown
      //then another person uploads the class and doesn't submit an assignment, we don't want to overwrite the score breakdown
      //it might look like this:
      // dontOverwrite: [{ key: "score_breakdown", oldValue: true, newValue: false }],
      endpointName: "assignments",
      endpoint:
        "api/v1/courses/course_id/assignments?per_page=1000&include[]=score_statistics",
      params: ["course_id"],
      supabaseTable: "assignment_data",
      //TODO: add required keys
    },
  ],
};
