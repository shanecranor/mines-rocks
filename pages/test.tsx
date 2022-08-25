import Timeline from 'react-calendar-timeline'
// make sure you include the timeline stylesheet or the timeline will not be styled
// import 'react-calendar-timeline/lib/Timeline.css'
import moment from 'moment'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
const groups = [{ id: 1, title: 'group 1' }, { id: 2, title: 'group 2' }]

const items = [
	{
		id: 1,
		group: 1,
		title: 'item 1',
		start_time: moment(),
		end_time: moment().add(2, 'day')
	},
	{
		id: 2,
		group: 2,
		title: 'item 2',
		start_time: moment().add(-0.5, 'hour'),
		end_time: moment().add(0.5, 'hour')
	},
	{
		id: 3,
		group: 1,
		title: 'item 3',
		start_time: moment().add(3, 'day'),
		end_time: moment().add(4, 'day')
	}
]

const Test: NextPage = () => {
	return (
		<div>
			Rendered by react!
			<Timeline
				groups={groups}
				items={items}
				defaultTimeStart={moment().add(-4, 'day')}
				defaultTimeEnd={moment().add(7, 'day')}
			/>
		</div>
	)
}

export default Test