const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const database = require('./database/database')
const render = require('./utilities/render')
const contacts = require('./routes/contacts')
const authenticate = require('./routes/auth')
const app = express()

app.set('view engine', 'ejs');
app.use(session({secret: 'keyboard cat'}))
app.use(flash())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use((request, response, next) => {
  response.locals.query = ''
  response.locals.user = request.user
  next()
})

app.get('/', (request, response) => { 
  response.render('index') 
})

app.use('/', authenticate)

app.use((request, response, next) => {
  response.locals.user = request.user
  next()
})

app.use((req, res, next) => { 
  req.user ? next() : res.redirect('/sign-in') 
})

app.get('/home', (request, response) => { 
  render.allContacts(response, 'home')
})

app.use('/contacts', contacts)

app.get('/sign-out', (request, response) => { 
  request.logout() 
  response.redirect('/') 
})

app.use((request, response) => { 
  response.render('not_found') 
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
