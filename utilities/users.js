const bcrypt = require('bcrypt')
const {add, get} = require('../database/database')

const salt = bcrypt.genSaltSync(10)
const makeSaltedPassword = (plainTextPassword) => 
  bcrypt.hashSync(plainTextPassword, salt)

const validatePassword = (plainTextPassword, saltedPassword) => {
  return bcrypt.compare(plainTextPassword, saltedPassword)
}

const addNewUser = (email, password) => {
  const saltedPassword = makeSaltedPassword(password)
  return add.newUser([email, saltedPassword])
}

const findOrCreate = (email, tokenSecret) => {
  return get.userByEmail(email)
  .then((user) => {
    if (!user) {
      return DbUser.addNewUser(email, tokenSecret)
    }
    return user
  })
}

module.exports = {makeSaltedPassword, validatePassword, addNewUser, findOrCreate}
