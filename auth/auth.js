const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const UserModel = require('../models/userModel');

passport.use(
    'login',
    new localStrategy(
      {
        usernameField: 'username',
        passwordField: 'password'
      },
      async (username, password, done) => {
        try {
          const user = await UserModel.findOne({ username });
  
          if (!user) {
            return done(null, false, { message: 'User not found' });
          }
  
          const validate = await user.isValidPassword(password);
  
          if (!validate) {
            return done(null, false, { message: 'Wrong Password' });
          }
          return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  
  passport.use(
      'signup',
      new localStrategy(
        {
          usernameField: 'username',
          emailField: 'email',
          passwordField: 'password',
          passReqToCallback: true,
        },
        async ( req, email, password, done) => {
          try {
            const user = await UserModel.create({username: req.body.username, email, password});
    
            return done(null, user);
          } catch (error) {
            if (error.message && error.message.includes("E11000 duplicate key error")) {
              // handle duplicate key error
              return done({ message: 'User already registered'} );
            } else {
              // handle other errors
              done(error);
            }
          }
        }
      )
    );
