const express = require('express');
const passport = require('passport');
const contentController = require("../controllers/contentController");

const router = express.Router();

router.get("/", contentController.getContent);

router.get('/signup', function(req, res, next) {
    res.render('signup', { message: req.flash('error') });
});

router.post('/signup', passport.authenticate('signup', {
  successRedirect : '/', //redirect to the secure profile section
  failureRedirect : '/signup', // redirect back to the signup page if there is an error
  failureFlash : true ,// allow flash messages
  successFlash : true
}));

router.get('/login', function(req, res, next) {
    res.render('login', { message: req.flash('error') });
  });


router.post('/login', (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
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