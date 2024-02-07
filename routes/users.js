const express = require('express');
const passport = require('passport');
const contentController = require("../controllers/contentController");

const router = express.Router();

router.get("/", contentController.getContent);

router.get('/signup', function(req, res, next) {
    res.render('signup', { message: req.flash('error') });
});

router.post('/signup', (req, res, next) => {
  passport.authenticate('signup', async (err, user, info) => {
    if (err) { 
      return next(err); 
    }
    if (!user) { 
      return res.redirect('/signup'); 
    }
    req.logIn(user, (err) => {
      if (err) { 
        return next(err); 
      }
      // Store the user's ID in the session
      req.session.userId = user._id;
      return res.redirect('/');
    });
  })(req, res, next);
});




router.get('/login', function(req, res, next) {
    res.render('login', { message: req.flash('error') });
  });


router.post('/login', (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) { 
        req.flash('error', 'Invalid username or password.');
        return res.redirect('/login'); 
      }
      req.logIn(user, (err) => {
          if (err) { 
            return next(err); 
          }
          // Store the user's ID in the session
          req.session.userId = user._id;
          return res.redirect('/');
      });
  })(req, res, next);
});

router.post('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});
module.exports = router;