const router = require('express').Router()
const {add, get, deleteContact, searchForContact} = require('../database/database')
const render = require('../utilities/render.js')

router.get('/new', (request, response) => {
  response.render('new')
})

router.post('/', (request, response) => {
  const {first_name, last_name} = request.body
  add.contact([first_name, last_name])
    .then( () => response.redirect('/home'))
    .catch( error => render.error(error, response, response) )
})

router.get('/:contactId', (request, response, next) => {
  const { contactId } = request.params
  if (!contactId || !/^\d+$/.test(contactId)) return next()
  get.contactById(contactId)
    .then(contact => response.render('show', { contact: contact[0] }))
    .catch( error => render.error(error, response, response) )
})

router.get('/:contactId/delete', (request, response) => {
  const contactId = request.params.contactId
  deleteContact(contactId)
    .then(contact => response.redirect('/home'))
    .catch(error => render.error(error, response, response))
})

router.get('/search', (request, response) => {
  const query = request.query.q
  searchForContact(query)
  .then(contacts => {
    console.log(contacts)
    response.render('search', { query, contacts: contacts })
  })
  .catch( error => render.error(error, response, response) )
})

module.exports = router
