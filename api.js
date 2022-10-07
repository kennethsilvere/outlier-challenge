const knex = require('./db')
const request = require('request')
const JSONStream = require('JSONStream')

module.exports = {
	getHealth,
	getStudent,
	getStudentGradesReport,
	getCourseGradesReport
}

async function getHealth(req, res, next) {
	try {
		await knex('students').first()
		return res.status(200).json({ success: true })
	} catch (e) {
		console.log(e)
		return res.status(500).end()
	}
}

async function getStudent(req, res, next) {
	try {
		const studentData = await getStudentDataById(req.params.id)
		return res.status(200).json(studentData)
	} catch (e) {
		console.log(e)
		return res.status(500).end()
	}
}

async function getStudentGradesReport(req, res, next) {
	try {
		const id = req.params.id
		const studentData = await getStudentDataById(id)
		return mergeWithCourseGradesFromRemoteSource(id, studentData, res)
	} catch (e) {
		console.log(e)
		return res.status(500).end()
	}
}

async function getCourseGradesReport(req, res, next) {
	try {
		return getCourseStatistics(res)
	} catch (e) {
		console.log(e)
		return res.status(500).end()
	}
}

async function getStudentDataById(id) {
	const studentData = await knex('students').select().where('id', id)
	return studentData[0]
}

async function mergeWithCourseGradesFromRemoteSource(
	idFromDB,
	studentData,
	res
) {
	let courseGrades = {}
	request('https://outlier-coding-test-data.netlify.app/grades.json')
		.pipe(JSONStream.parse('*'))
		.on('data', (gradesData) => {
			idFromDB = +idFromDB
			const idFromJSON = +gradesData.id
			if (idFromJSON === idFromDB) {
				courseGrades[gradesData.course] = gradesData.grade
			}
		})
		.on('end', () => {
			const studentDataWithGrades = {
				...studentData,
				course_grades: courseGrades
			}
			return res.status(200).json(studentDataWithGrades)
		})
}

async function getCourseStatistics(res) {
	const courses = {}

	request('https://outlier-coding-test-data.netlify.app/grades.json')
		.pipe(JSONStream.parse('*'))
		.on('data', (d) => {
			const courseName = d.course
			if (!courses[courseName]) {
				courses[courseName] = {
					highestGrade: +d.grade,
					lowestGrade: +d.grade,
					averageGrade: {
						count: 0,
						...d
					}
				}
			}

			if (courses[courseName].highestGrade < +d.grade) {
				courses[courseName].highestGrade = +d.grade
			}
			if (courses[courseName].lowestGrade > +d.grade) {
				courses[courseName].lowestGrade = +d.grade
			}
			courses[courseName].averageGrade.grade += +d.grade
			courses[courseName].averageGrade.count++
		})
		.on('end', () => {
			for (const key of Object.keys(courses)) {
				courses[key].averageGrade = +(
					courses[key].averageGrade.grade /
					courses[key].averageGrade.count
				).toFixed(2)
			}
			return res.status(200).json(courses)
		})
}
