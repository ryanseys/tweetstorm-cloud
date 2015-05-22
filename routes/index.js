var express = require('express');
var router = express.Router();
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var Twit = require('twit');
var tweetstorm = require('tweetstorm');
var async = require('async');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback'
  },
  function(token, tokenSecret, profile, done) {
    return done(null, { username: profile.username, token: token, tokenSecret: tokenSecret });
  }
));

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.render('loggedin', { title: 'Tweet Storm', user: req.user.username });
  } else {
    res.render('index', { title: 'Tweet Storm' });
  }
});

router.get('/logout', function(req, res, next) {
  if(req.session) {
    req.session.destroy(function() {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

router.post('/tweetstorm', function(req, res, next) {
  var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: req.user.token,
    access_token_secret: req.user.tokenSecret
  });

  var text = req.body.text;

  if (text && typeof text === 'string' && text !== '') {
    var tweets = tweetstorm(text);
    async.mapSeries(tweets, function(tweetText, done) {
      T.post('statuses/update', { status: tweetText }, function(err, data, resp) {
        done(err, data);
      });
    }, function (err, tweets) {
      if (!err) {
        res.send({ success: true, message: 'Success!', tweets: tweets });
      } else {
        res.send({ success: false, message: 'Something went wrong when tweeting!', tweets: tweets });
      }
    });
  } else {
    res.status(404).send({ success: false, message: 'No text found!', tweets: [] });
  }
});

router.get('/auth/twitter', passport.authenticate('twitter'));

var passOpts = { failureRedirect: '/login' };

router.get('/auth/twitter/callback', passport.authenticate('twitter', passOpts), function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/');
});

module.exports = router;
