import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = `https://zgpuwdgtgbfsdkfgarvm.supabase.co`
const SUPABASE_PUBLIC_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncHV3ZGd0Z2Jmc2RrZmdhcnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0OTg2NTksImV4cCI6MTk5NDA3NDY1OX0.qYB3iw9p99ksJllvf7kpymEx5--Ffz_xB0hlFsWTfbA`
import { Database } from '@/types/supabase'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY)
export type Courses = Database["public"]["Tables"]["course_summary_data"]["Row"]
export const getGlobalCourseList = async () => {
	return await supabase
	.from('course_summary_data')
	.select('*')
}
export type CoursesResponse = Awaited<ReturnType<typeof getGlobalCourseList>>
export type CoursesResponseSuccess = CoursesResponse["data"] & {
	course_summary_data: Courses[]
}
export type CoursesResponseError = CoursesResponse["error"]



