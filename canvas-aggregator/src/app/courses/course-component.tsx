import { Course } from "@/services/database"
import styles from './course-component.module.scss'
type CourseAttributes = {
	semester: string;
	courseCode: string;
	courseYear: string;
	courseName: string;
}
function cyrb128(str:string) {
	let h1 = 1779033703, h2 = 3144134277,
			h3 = 1013904242, h4 = 2773480762;
	for (let i = 0, k; i < str.length; i++) {
			k = str.charCodeAt(i);
			h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
			h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
			h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
			h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
	}
	h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
	h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
	h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
	h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
	return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}
function mulberry32(a: number) {
	return function() {
		var t = a += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}
export default function CourseComponent({courseData}: {courseData: Course}){
	const { 
		semester,
		courseCode, 
		courseYear, 
		courseName } = getCourseAttributes(courseData)
	//generate 20 random numbers between 0 and 100
	var seed = cyrb128(courseCode);
	var rand = mulberry32(seed[0]);
	const randomGrades = Array.from({length: 1}, () => Math.floor(rand() * 100))
	//calculate the average of those numbers
	const averageGrade = randomGrades.reduce((a, b) => a + b, 0) / randomGrades.length;
	//round to 2 decimal places
	const averageGradeRounded = Math.round(averageGrade * 100) / 100
	//get the min and max of those numbers
	const minGrade = Math.min(...randomGrades)
	const maxGrade = Math.max(...randomGrades)
	//get the median of those numbers
	const medianGrade = randomGrades.sort()[Math.floor(randomGrades.length / 2)]
	//get the upper and lower quartiles of those numbers	
	const lowerQuartile = randomGrades.sort()[Math.floor(randomGrades.length / 4)]
	const upperQuartile = randomGrades.sort()[Math.floor(randomGrades.length * 3 / 4)]
	return <div className={styles["course-component"]}>
		<div className={styles['course-attributes']}>
			<div className={styles.code}>{courseCode}</div>
			<span className={styles.when}>{semester} {courseYear}</span>
		</div>
		<div className={styles["course-data-graph"]}> 
			<div className={styles["avg-grade"]} style={{left: `${averageGradeRounded}%`}}/> 
		</div>




		{/* <span className={styles.semester}>{courseData.name}</span> */}
		{/* <span className={styles.name}>    {courseName}</span> */}
	</div>
}

const getCourseAttributes = (course: Course): CourseAttributes => {
	const dataString = course.course_code || "";
	// split on both . and space
	const dataList = dataString.split(/\.|\s/)
	const semester = dataList[0].replace("Sprg", "Spring").replace("Smr", "Summer")
	const courseYear = dataList[1]
	// find the first 3 digit number, then remove everything after it
	const courseCode = dataList[2].replace(/(\d{3}).*/, "$1");
	return {
		semester, 
		courseCode,
		courseYear,
		courseName: course.name || ""
	}
}