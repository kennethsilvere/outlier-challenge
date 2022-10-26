const fs = require('fs')
const request = require('request')
const gradesDb = require('./grades_db')

console.log('Fetching students.db...Please wait.')
request('https://outlier-coding-test-data.netlify.app/students.db').pipe(
  fs.createWriteStream('students.db')
)

const stream = request(
  'https://outlier-coding-test-data.netlify.app/grades.json'
).pipe(fs.createWriteStream('grades.json'))

stream.on('finish', () => {
  gradesDb.schema
    .hasTable('grades')
    .then(createTableForGrades)
    .then(fillGradesTable)
    .finally(() => gradesDb.destroy())
    .catch((err) => console.log(err))
})

async function createTableForGrades (gradesTableExists) {
  if (!gradesTableExists) {
    await gradesDb.schema
      .createTable('grades', (table) => {
        table.increments('grade_id').primary()
        table.integer('student_id').notNullable()
        table.string('course').notNullable()
        table.integer('grade').notNullable()
        table.timestamps(true, true)
        table.unique(['student_id', 'course', 'grade'])
      })
      .then(() => console.log('Created Grades Table.'))
      .catch((err) => console.log(err))
  } else {
    console.log('Grades Table already exists')
  }
}

async function fillGradesTable () {
  console.log('Populating Grades DB...')
  const loader = showLoader()
  const gradesList = require('./grades.json')

  const insertGrades = gradesList.map((g) => {
    const { id, ...rest } = g
    return {
      student_id: id,
      ...rest
    }
  })

  const chunkSize = 500
  while (insertGrades.length > 0) {
    const gradesChunk = insertGrades.splice(0, chunkSize)
    await gradesDb
      .insert(gradesChunk)
      .into('grades')
      .onConflict(['student_id', 'course', 'grade'])
      .ignore()
      .catch((err) => console.log(err))
  }
  clearInterval(loader)
}

function showLoader () {
  const P = ['\\', '|', '/', '-']
  let x = 0
  return setInterval(function () {
    process.stdout.write('\r' + P[x++])
    x &= 3
  }, 250)
}
