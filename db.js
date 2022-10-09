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

let rawdata = fs.readFileSync('grades.json')
let grades = JSON.parse(rawdata)
let destroy = () => knex.destroy()

module.exports = { knex, grades, destroy }
