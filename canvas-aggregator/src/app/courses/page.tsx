'use client'
import Head from 'next/head'
// react query imports
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient()
import { getGlobalCourseList } from '@/services/database'
export default function Home() {
	const { isLoading, error, data: courseList } = useQuery({
			queryKey: ["supaCourseList"],
			queryFn: getGlobalCourseList,
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 60 * 6,
			cacheTime: 1000 * 60 * 60 * 6
			//it will only refetch if the page is open for 6 hours
	});
	
	return (
		<>
			<Head>
				<title>View Course Data</title>
				<meta name="description" content="crowd sourced course data" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<QueryClientProvider client={queryClient}>
				<main>
					<h1>View Course Data</h1>
					{
						isLoading ? <div>Loading...</div> : 
						courseList?.data?.map(
							(course: any) => <div key={course.id}>{course.name}</div>)
					}
				</main>
			</QueryClientProvider>
		</>
	)
}

