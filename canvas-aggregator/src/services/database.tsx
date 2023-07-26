import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = `https://zgpuwdgtgbfsdkfgarvm.supabase.co`;
const SUPABASE_PUBLIC_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncHV3ZGd0Z2Jmc2RrZmdhcnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0OTg2NTksImV4cCI6MTk5NDA3NDY1OX0.qYB3iw9p99ksJllvf7kpymEx5--Ffz_xB0hlFsWTfbA`;
import { Database } from "@/types/supabase";
import { IGNORE_CLASSES } from "./constants/constants";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
export type Course = Database["public"]["Tables"]["course_summary_data"]["Row"];
export type Assignment =
  Database["public"]["Tables"]["assignment_data"]["Row"] & {
    score_statistics: { [key: string]: number };
  };
export type AssignmentGroup =
  Database["public"]["Tables"]["assignment_group_data"]["Row"];
export type GradeStatistics = {
  max: number | "N/A";
  min: number | "N/A";
  mean: number | "N/A";
  median: number | "N/A";
  upper_q: number | "N/A";
  lower_q: number | "N/A";
};
export const STAT_KEYS: (
  | "max"
  | "min"
  | "mean"
  | "median"
  | "upper_q"
  | "lower_q"
)[] = ["max", "min", "mean", "median", "upper_q", "lower_q"];

const getResponseData = (response: any) => {
  if (response.error) {
    console.error("Error fetching from supabase");
    console.error(response.error);
    throw response.error;
  }
  if (!response.data) return [];
  return response.data;
};

export const getAssignmentGroups: () => Promise<
  AssignmentGroup[] | []
> = async () => {
  const response = await supabase.from("assignment_group_data").select("*");
  return getResponseData(response);
};

export const getAssignments: () => Promise<Assignment[] | []> = async () => {
  const response = await supabase.from("assignment_data").select("*");
  return getResponseData(response);
};

const getCourseList: () => Promise<Course[] | []> = async () => {
  const response = await supabase.from("course_summary_data").select("*");
  return getResponseData(response);
};

export const getCourseListFiltered: () => Promise<Course[] | []> = async () => {
  const courseList = await getCourseList();
  //filter out courses that are in the ignore list
  //shouldn't need this because we aren't uploading ignored courses but why not
  return courseList.filter(
    (course: Course) => course.name && !isIgnoredCourse(course.name)
  );
};

const isIgnoredCourse = (courseName: string) => {
  return IGNORE_CLASSES.some((ignoredClass) =>
    courseName.includes(ignoredClass)
  );
};
