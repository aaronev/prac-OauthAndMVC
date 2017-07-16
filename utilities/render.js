const { get } = require('../database/database')

var Render = {}

Render.error = (error, response) => {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`)
}

Render.allContacts = (res, viewEjs) => { 
  get.allContacts()
    .then( contacts => res.render(viewEjs, {contacts}))
}

module.exports = Render