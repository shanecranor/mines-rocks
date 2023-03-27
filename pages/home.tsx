import type { AppProps } from 'next/app'
import Head from 'next/head'
// react query imports
import { useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = `https://zgpuwdgtgbfsdkfgarvm.supabase.co`
const SUPABASE_PUBLIC_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncHV3ZGd0Z2Jmc2RrZmdhcnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg0OTg2NTksImV4cCI6MTk5NDA3NDY1OX0.qYB3iw9p99ksJllvf7kpymEx5--Ffz_xB0hlFsWTfbA`

export default function Home() {
	const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY)
	const { isLoading, error, data: supaCourseList } = useQuery(
		{
			queryKey: "supaCourseList",
			queryFn: async () => {
				let { data: course_summary_data, error } = await supabase
				.from('course_summary_data')
				.select('*')
				return course_summary_data
			},
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 60 * 6,
			cacheTime: 1000 * 60 * 60 * 6
			//it will only refetch if the page is open for 6 hours
		}
	);
	return (
		<>
			<Head>
				<title>View Course Data</title>
				<meta name="description" content="crowd sourced course data" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<h1>View Course Data</h1>
				{
					isLoading ? <div>Loading...</div> : 
					supaCourseList?.map(
						(course: any) => <div>{course.name}</div>)
				}
			</main>
		</>
	)
}

