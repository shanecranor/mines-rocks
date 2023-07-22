import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = `https://zgpuwdgtgbfsdkfgarvm.supabase.co`
const SUPABASE_PUBLIC_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncHV3ZGd0Z2Jmc2RrZmdhcnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0OTg2NTksImV4cCI6MTk5NDA3NDY1OX0.qYB3iw9p99ksJllvf7kpymEx5--Ffz_xB0hlFsWTfbA`
import { Database } from '@/types/supabase'
import { IGNORE_CLASSES } from './constants/constants'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY)
export type Course = Database["public"]["Tables"]["course_summary_data"]["Row"]

const getGlobalCourseList = async () => {
	return await supabase
	.from('course_summary_data')
	.select('*')
}


export const getGlobalCourseListFiltered = async () => {
	const courseList = await getGlobalCourseList()
	if (courseList.error){
		console.error("Error fetching course list from supabase")
		console.error(courseList.error)
	}
	if (!courseList.data) return []
	//filter out courses that are in the ignore list 
	//shouldn't need this because we aren't uploading ignored courses but why not
	return courseList.data.filter(
		(course: Course) => (course.name && !isIgnoredCourse(course.name))
	)
}

const isIgnoredCourse = (courseName: string) => {
	return IGNORE_CLASSES.some((ignoredClass) => courseName.includes(ignoredClass))
}



