let knex

if (!knex) {
  knex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: './grades.db'
    },
    useNullAsDefault: true
  })
}

module.exports = knex
