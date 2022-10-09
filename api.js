const { knex, grades } = require('./db')
const { Worker } = require('worker_threads')

module.exports = {
	getHealth,
	getStudent,
	getStudentGradesReport,
	getCourseGradesReport
}

let result

if (!result) {
	runService(grades).then((r) => {
		result = r
	})
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
	if (!result) {
		runService(grades).then((r) => {
			result = r
			return res.status(200).json(result)
		})
	} else {
		return res.status(200).json(result)
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
	const courseGrades = {}

	grades.forEach((gradesData) => {
		idFromDB = +idFromDB
		const idFromJSON = +gradesData.id
		if (idFromJSON === idFromDB) {
			courseGrades[gradesData.course] = gradesData.grade
		}
	})

	const studentDataWithGrades = {
		...studentData,
		course_grades: courseGrades
	}
	return res.status(200).json(studentDataWithGrades)
}

function runService(workerData) {
	return new Promise((resolve, reject) => {
		const worker = new Worker('./worker.js', { workerData })
		worker.on('message', resolve)
		worker.on('error', reject)
		worker.on('exit', (code) => {
			if (code !== 0)
				reject(new Error(`Worker stopped with exit code ${code}`))
		})
	})
}
