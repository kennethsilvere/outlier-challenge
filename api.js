const { knex, grades } = require('./db')
// const { Worker } = require('worker_threads')

module.exports = {
  getHealth,
  getStudent,
  getStudentGradesReport,
  getCourseGradesReport
}

let courses

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
    return mergeWithCourseGradesFromRemoteSource(id, studentData, res)
  } catch (e) {
    console.log(e)
    return res.status(500).end()
  }
}

async function getCourseGradesReport (req, res, next) {
  courses = grades.reduce((group, courseItem) => {
    const { course } = courseItem
    group[course] = group[course] ?? []
    group[course].push(courseItem)
    return group
  }, {})
  setImmediate(() => {
    return processStatistics().then((d) => {
      return res.status(200).json(d)
    })
  })
}

async function getStudentDataById (id) {
  const studentData = await knex('students').select().where('id', id)
  return studentData[0]
}

async function mergeWithCourseGradesFromRemoteSource (
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

function processStatistics () {
  const courseStatistics = {}
  function getAverage (courses) {
    const courseGrades = courses.map((c) => +c.grade)
    const total = courseGrades.reduce((partialSum, a) => partialSum + a, 0)
    const avg = (total / courses.length).toFixed(2)
    return +avg
  }
  return new Promise((resolve, reject) => {
    for (let i = 0; i < Object.keys(courses).length; i++) {
      const key = Object.keys(courses)[i]
      setTimeout(() => {
        courses[key].sort((a, b) => +b.grade - +a.grade)
        courseStatistics[key] = {
          highestGrade: courses[key][0].grade,
          lowestGrade: courses[key][courses[key].length - 1].grade,
          averageGrade: getAverage(courses[key])
        }
      }, 0)
    }
    setTimeout(() => {
      resolve(courseStatistics)
    }, 0)
  })
}
