const router = require('express').Router()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const { get } = require('../database/database')
const User = require('../utilities/users')

router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  if (user.provider === 'twitter') {
    done(null, user)
  } else {
    get.userById(user.id)
    .then((user) => done(null, user[0]))
  }
})

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  (request, email, plainTextPassword, done) => {
    get.userByEmail(email)
    .then((user) => {
      if (user.length === 0) {
        return done(null, false, request.flash('loginError', 'Invalid email or password.'))
      }
      User.validatePassword(plainTextPassword, user[0].salted_password)
        .then((isValid) => {
          if (!isValid) {
            return done(null, false, request.flash('loginError', 'Invalid email or password.'))
           }
          console.log(`${user[0].email} signed in`);
          return done(null, user[0])
      })
    })
  })
)

passport.use(new TwitterStrategy({
    consumerKey: 'GUA8YmjPT7ON2duLKATsIiGCD',
    consumerSecret: 'Ag2uqebCOJedaqIFBSdXiQiKOjYsuGR90cWySteTqUEXRWLXwm',
    userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
    callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, done) {
    done(null, profile)
  }
))

router.get('/auth/twitter', passport.authenticate('twitter'))
router.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/home',
    failureRedirect: '/sign-in'})
)

router.route('/sign-in')
  .get((request, response) => {
    response.render('sign_in', { loginError: request.flash('loginError') })
  })
  .post( passport.authenticate('local', { successRedirect: '/home',
    failureRedirect: '/sign-in',
    failureFlash: true 
  }))

router.route('/sign-up')
  .get((request, response) => {
    response.render('sign_up', { creationError: request.flash('creationError')})
  })
  .post((request, response) => {
    const { email, password } = request.body
    get.userByEmail(email)
    .then( user => {
      if (user.length !== 0) {
        request.flash('creationError', 'User already exists.')
        response.redirect('/sign-up')
      } else {
        User.addNewUser(email, password)
        .then(() => {
          passport.authenticate('local')
          (request, response, () => {
            response.redirect('/home')
          })
        })
      }
    })
  })

module.exports = router
