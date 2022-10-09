const { workerData, parentPort } = require('worker_threads')
const courses = {}
const courseStatistics = {}

workerData.forEach((d) => {
	const courseName = d.course
	if (!courses[courseName]) {
		courses[courseName] = []
	} else {
		courses[courseName].push(d)
	}
})

for (const key of Object.keys(courses)) {
	courses[key].sort((a, b) => +b.grade - +a.grade)
	courseStatistics[key] = {
		highestGrade: courses[key][0].grade,
		lowestGrade: courses[key][courses[key].length - 1].grade,
		averageGrade: getAverage(courses[key])
	}
}

function getAverage(courses) {
    const courseGrades = courses.map(c => +c.grade)
	const total = courseGrades.reduce((partialSum, a) => partialSum + a, 0)
	const avg = (total / courses.length).toFixed(2)
	return +avg
}


parentPort.postMessage(courseStatistics)
