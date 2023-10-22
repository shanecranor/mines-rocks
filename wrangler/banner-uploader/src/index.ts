import { getCourseSearchResults, getTermCode, setTerm } from "./banner";
import { createClient } from "@supabase/supabase-js";
import { isSeason } from "./types";
import { Row, cleanAndFilterData } from "../../shared-util/cleanData";
import { isArray } from "@legendapp/state";

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler deploy src/index.ts --name my-worker` to deploy your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE: string;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const { SUPABASE_URL, SUPABASE_SERVICE_ROLE } = env;
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

      const url = new URL(request.url);
      const year = url.searchParams.get("year");
      const season = url.searchParams.get("season")?.toLowerCase();
      const subject = url.searchParams.get("subject");
      const courseNumber = url.searchParams.get("courseNumber");
      const canvasCourseID = url.searchParams.get("canvasCourseID");
      if (!year || !season) {
        throw new Error("Missing year or season");
      }
      if (!isSeason(season)) {
        throw new Error(`Invalid season ${season}`);
      }
      if (subject === null || courseNumber === null) {
        throw new Error("Missing subject or courseNumber");
      }
      //check if season matches the type of Season
      const termCode = await getTermCode(season, year);
      const { data: _, cookies } = await setTerm(termCode);
      const courseData = await getCourseSearchResults(
        { termCode, subject, courseNumber },
        cookies
      );
      if (!isArray(courseData)) {
        throw new Error(`courseData is not an array: ${courseData}`);
      }
      const updatedCourseData = courseData.map((row) => ({
        ...row,
        searchInput: `${subject}${courseNumber} ${season} ${year}`,
      }));

      //get the column names from the table
      const { data: tableKeys } = await supabase.rpc("list_columns", {
        table_id: "banner_course_data",
      });
      if (typeof courseData === "string") {
        throw new Error(courseData);
      }
      //clean the data
      const cleanedData = cleanAndFilterData(
        updatedCourseData as Row[], //probably should add a type guard
        tableKeys
      );
      //   if (canvasCourseID && canvasCourseID !== null) {

      const upsertResponse = await upsertData(
        cleanedData,
        "banner_course_data",
        supabase
      );
      // console.log(upsertResponse);
      return new Response(JSON.stringify(cleanedData));
    } catch (e: any) {
      return new Response(e.message, { status: 500 });
    }
  },
};

export async function upsertData(data: Row[], table: string, supabase: any) {
  // upsert the data to the supabase table
  const upsertResponse = await supabase.from(table).upsert(data);
  const { error } = upsertResponse;
  if (error) return `Upsert ERROR: ${JSON.stringify(error)}`;
  return upsertResponse;
}
