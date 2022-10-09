const fs = require('fs')
let knex

if (!knex) {
  knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './students.db'
    },
    useNullAsDefault: true
  })
}

const rawdata = fs.readFileSync('grades.json')
const grades = JSON.parse(rawdata)
const destroy = () => knex.destroy()

module.exports = { knex, grades, destroy }
