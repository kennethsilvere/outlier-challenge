const { knex } = require('./db')
const gradesDb = require('./grades_db')

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

async function getHealth (req, res, next) {
  try {
    await knex('students').first()
    return res.status(200).json({ success: true })
  } catch (e) {
    console.log(e)
    return res.status(500).end()
  }
}

async function getStudent (req, res, next) {
  try {
    const studentData = await getStudentDataById(req.params.id)
    delete studentData.password_hash
    return res.status(200).json(studentData)
  } catch (e) {
    console.log(e)
    return res.status(500).end()
  }
}

async function getStudentGradesReport (req, res, next) {
  try {
    const id = req.params.id
    const studentData = await getStudentDataById(id)
    if (!studentData) {
      return res.status(404).json({ error: 'Student does not exit' })
    }

    delete studentData.password_hash
    const studentGrades = await gradesDb('grades')
      .select('course', 'grade')
      .where('student_id', studentData.id)

    studentData.grades = {}
    for (const g of studentGrades) {
      studentData.grades[g.course] = g.grade
    }
    return res.status(200).json(studentData)
    // return mergeWithCourseGradesFromRemoteSource(id, studentData, res)
  } catch (e) {
    console.log(e)
    return res.status(500).end()
  }
}

async function getCourseGradesReport (req, res, next) {
  try {
    const courseStatistics = await gradesDb('grades')
      .select('course')
      .max('grade', { as: 'highestGrade' })
      .min('grade', { as: 'lowestGrade' })
      .avg('grade', { as: 'averageGrade' })
      .groupBy('course')

    const gradesReport = {}
    for (const c of courseStatistics) {
      gradesReport[c.course] = {
        ...c,
        course: undefined
      }
    }

    return res.status(200).json(gradesReport)
  } catch (e) {
    console.log(e)
    return res.status(500).end()
  }
}

async function getStudentDataById (id) {
  const studentData = await knex('students').select().where('id', id)
  return studentData[0]
}
