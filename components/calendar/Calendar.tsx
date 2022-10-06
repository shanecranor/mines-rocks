import Timeline, {
	TimelineMarkers,
	TodayMarker,
	CursorMarker
} from 'react-calendar-timeline'
import moment from 'moment'
function assignmentsToCal(assignments: any, courseList: any, categories: any) {
	const categoryList = categories.split("|")
	const out = { groups: [], items: [] };
	let idx = 0;
	for (const course in assignments) {
		const courseName = courseList.filter((item: any) => (item.id == course))[0].course_code.split(".")[1]
		if (assignments[course].length <= 0) { continue }
		for (const assignment in assignments[course]) {
			const currentAssignment = assignments[course][assignment]
			//skip to next assignment if no due date is assigned
			if (!currentAssignment.due_at) continue
			let category = categoryList.filter((cat: string) => currentAssignment.name.includes(cat))
			if (!category.length) category.push("")
			const groupTitle = `${courseName}: ${category[0]}`
			const groupMatch = out.groups.filter((group: any) => group.title == groupTitle)
			// if no groups match the correct title create new group
			let groupID: number;
			if (!groupMatch.length) {
				groupID = out.groups.length
				out.groups.push({
					id: groupID,
					title: groupTitle,
					groupProps: {
						style: {
							background: "blue"
						}
					}
				})
			} else { //otherwise get group id from match
				groupID = groupMatch[0].id
			}
			const calItem = {
				id: idx,
				group: groupID,
				title: currentAssignment.name,
				start_time: moment(currentAssignment.due_at).add(-2, "day"),
				end_time: moment(currentAssignment.due_at),
				itemProps: {
					style: {
						background: currentAssignment?.submission?.submitted_at ? "rgba(0,0,255,0.5)" : "red"
					}
				}
			}
			out.items.push(calItem)
			idx++
		}
	}
	return out
}

export default function Calendar({ assignments, courseList, categories }) {
	const calendarItems = assignmentsToCal(assignments, courseList, categories)
	const minTime = moment().add(-2, 'months')
	const maxTime = moment().add(5, 'months')
	return (
		<Timeline
			groups={calendarItems.groups}
			items={calendarItems.items}
			horizontalLineClassNamesForGroup={group =>
				[`group-${group.id}`]
			}
			stackItems
			defaultTimeStart={moment().add(-20, 'day')}
			defaultTimeEnd={moment().add(40, 'day')}
			minZoom={60 * 60 * 1000 * 24 * 3}
			maxZoom={60 * 60 * 1000 * 24 * 365}
			onTimeChange={
				(visibleTimeStart, visibleTimeEnd, updateScrollCanvas) => {
					if (visibleTimeStart < minTime && visibleTimeEnd > maxTime) {
						updateScrollCanvas(minTime, maxTime)
					} else if (visibleTimeStart < minTime) {
						updateScrollCanvas(minTime, minTime + (visibleTimeEnd - visibleTimeStart))
					} else if (visibleTimeEnd > maxTime) {
						updateScrollCanvas(maxTime - (visibleTimeEnd - visibleTimeStart), maxTime)
					} else {
						updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
					}
				}
			}
		><TimelineMarkers>
				<TodayMarker />
			</TimelineMarkers>
		</Timeline>
	)
}