const User = require("../models/User");

exports.mustBeLoggedIn = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be log in to perform that action");
    req.session.save(function() {
      res.redirect("/");
    });
  }
};

exports.login = function(req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(result => {
      req.session.user = { avatar: user.avatar, username: user.data.username };
      req.session.save(function() {
        res.redirect("/");
      });
    })
    .catch(err => {
      req.flash("errors", err);
      req.session.save(function() {
        res.redirect("/");
      });
    });
};

exports.logout = function(req, res) {
  req.session.destroy(function() {
    res.redirect("/");
  });
};

exports.register = function(req, res) {
  let user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = { username: user.data.username, avatar: user.avatar };
      req.session.save(function() {
        res.redirect("/");
      });
    })
    .catch(reqErrors => {
      reqErrors.forEach(function(error) {
        req.flash("reqErrors", error);
      });
      req.session.save(function() {
        res.redirect("/");
      });
    });
};

exports.home = function(req, res) {
  if (req.session.user) {
    res.render("home-dashboard");
  } else {
    res.render("home-guest", {
      errors: req.flash("errors"),
      reqErrors: req.flash("reqErrors")
    });
  }
};
