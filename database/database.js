const pgp = require('pg-promise')()
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/contacts'
const db = pgp(connectionString)

insert = (table, config, values) => 
  db.none(`INSERT INTO ${table} ${config} VALUES ($1, $2)`, values)

selectAll = table => 
  db.any(`SELECT * FROM ${table}`)

deleteContact = contactId => 
  db.none(`DELETE FROM contacts WHERE id = $1`, contactId)

selectCondition = (table, column, value) => 
  db.any(`SELECT * FROM ${table} WHERE ${column} = $1`, value)

searchForContact = searchQuery => 
  db.any(`SELECT * FROM contacts WHERE first_name = $1 OR last_name = $1`, searchQuery)

var get = {
  userByEmail: email => selectCondition('users', 'email', email),
  userById: id => selectCondition('users', 'id', id),
  allContacts: () => selectAll('contacts'),
  contactById: id => selectCondition('contacts', 'id', id)
}

var add = {
  contact: values => insert('contacts', '(first_name, last_name)', values),
  newUser: values => insert('users', '(email, salted_password)', values)
}

module.exports = { get, add, searchForContact, deleteContact }