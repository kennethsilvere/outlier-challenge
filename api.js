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
	throw new Error('This method has not been implemented yet.')
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
