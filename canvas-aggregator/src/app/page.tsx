'use client'
import Image from 'next/image'
import styles from './page.module.css'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import Head from 'next/head'
import { Course, getGlobalCourseListFiltered } from '@/services/database'
import CourseComponent from '@/app/courses/course-component'

const queryClient = new QueryClient()

export default function Home() {
  const { isLoading, error, data: courseList } = useQuery({
    queryKey: ["supaCourseList"],
    queryFn: getGlobalCourseListFiltered,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60 * 6,
    cacheTime: 1000 * 60 * 60 * 6
    //it will only refetch if the page is open for 6 hours
});

  return (
		<>
    
			<Head>
				<title>Find your perfect course</title>
				<meta name="description" content="crowd sourced course data" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<QueryClientProvider client={queryClient}>
				<main>
					<h1>See more than the course description</h1>
          <input type="text" placeholder="Search for a course"></input>
          <div>Filter:
            <div>
              Semester
            </div>
          </div>
					{
						isLoading ? <div>Loading...</div> : 
						courseList?.map(
							(course: Course) => <CourseComponent courseData={course} key={course.id}/>)
					}
				</main>
			</QueryClientProvider>
		</>
  )
}
