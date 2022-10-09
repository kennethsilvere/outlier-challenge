const tape = require('tape')
const jsonist = require('jsonist')
const testValidations = require('./test-validations')
const api = require('./api')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error(
        'Error connecting to sqlite database; did you initialize it by running `npm run init-db`?'
      )
    }
    t.ok(data.success, 'should have successful healthcheck')
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('getStudent', async function (t) {
  const url = `${endpoint}/student/43`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error(
        'Error connecting to sqlite database; did you initialize it by running `npm run init-db`?'
      )
    }
    t.ok(
      testValidations.validateAgainstStudentData(data),
      'should have successful healthcheck'
    )
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('getStudent', async function (t) {
  const url = `${endpoint}/student/43`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error(
        'Error connecting to sqlite database; did you initialize it by running `npm run init-db`?'
      )
    }
    t.ok(
      testValidations.validateAgainstStudentData(data),
      'should return the student data for the student of id 43'
    )
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('getStudentGradesReport', async function (t) {
  const url = `${endpoint}/student/82`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error(
        'Error connecting to sqlite database; did you initialize it by running `npm run init-db`?'
      )
    }
    t.ok(
      testValidations.validateAgainstStudentGrades(data),
      'should return the student grades report for the student of id 82'
    )
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('getCourseGradesReport', async function (t) {
  const url = `${endpoint}/course/all/grades`
  try {
    const { data, response } = await jsonist.get(url)
    if (response.statusCode !== 200) {
      throw new Error(
        'Error connecting to sqlite database; did you initialize it by running `npm run init-db`?'
      )
    }
    t.ok(
      testValidations.validateAgainstCourseStatistics(data),
      'should return the course grades statistics for all the students'
    )
    t.end()
  } catch (e) {
    t.error(e)
  }
})

tape('cleanup', function (t) {
  server.closeDB()
  server.close()
  t.end()
})
