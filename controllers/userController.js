const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

exports.sharedProfileData = async function(req, res, next) {
  let isVisitorProfile = false;
  let isFollowing = false;
  if (req.session.user) {
    isVisitorProfile = req.profileUser._id.equals(req.session.user._id);
    isFollowing = await Follow.isVisitorFollowing(
      req.profileUser._id,
      req.visitorId
    );
  }
  req.isVisitorProfile = isVisitorProfile;
  req.isFollowing = isFollowing;
  next();
};

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
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id
      };
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
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id
      };
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

exports.ifUserExists = function(req, res, next) {
  User.findByUsername(req.params.username)
    .then(function(userDocument) {
      req.profileUser = userDocument;
      next();
    })
    .catch(function() {
      res.render("404");
    });
};

exports.profilePostsScreen = function(req, res) {
  // ask our post model for posts by certain author id
  Post.findByAuthorId(req.profileUser._id)
    .then(function(posts) {
      res.render("profile", {
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        isFollowing: req.isFollowing,
        isVisitorProfile: req.isVisitorProfile
      });
    })
    .catch(function() {
      res.render("404");
    });
};

exports.profileFollowsersScreen = async function(req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id);
    res.render("profile-followers", {
      followers: followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorProfile: req.isVisitorProfile
    });
  } catch {
    res.render("404");
  }
};
