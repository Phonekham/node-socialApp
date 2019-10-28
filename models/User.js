const bcrypt = require("bcryptjs");
const md5 = require("md5");

const usersCollection = require("../db")
  .db()
  .collection("users");
const validator = require("validator");

const User = function(data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanUp = function() {
  if (typeof this.data.username != "string") this.data.username = "";
  if (typeof this.data.email != "string") this.data.email = "";
  if (typeof this.data.password != "string") this.data.password = "";

  // Get rid of any bogus properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  };
};

User.prototype.validate = function() {
  return new Promise(async (resolve, reject) => {
    if (this.data.username == "") {
      this.errors.push("You must provide a username");
    }
    if (!validator.isEmail(this.data.email)) {
      this.errors.push("You must provide a email address");
    }
    if (
      this.data.username != "" &&
      !validator.isAlphanumeric(this.data.username)
    ) {
      this.errors.push("username can contain only letters and numbers");
    }
    if (this.data.password == "") {
      this.errors.push("You must provide a password");
    }
    if (this.data.password.length > 0 && this.data.password.lengthngth < 12) {
      this.errors.push("password must be atleast 12");
    }
    if (this.data.password.length > 100) {
      this.errors.push("password can't exceed 100");
    }
    if (this.data.username.length > 0 && this.data.username.length < 3) {
      this.errors.push("username must be atleast 3");
    }
    if (this.data.username.length > 30) {
      this.errors.push("username can't exceed 30");
    }
    // Only if username is valid then check to see if its already taken
    if (
      this.data.username.length > 2 &&
      this.data.username.length < 31 &&
      validator.isAlphanumeric(this.data.username)
    ) {
      let usernameExists = await usersCollection.findOne({
        username: this.data.username
      });
      if (usernameExists) this.errors.push("That username is already taken");
    }
    // Only if email is valid then check to see if its already taken
    if (validator.isEmail(this.data.email)) {
      let emailExists = await usersCollection.findOne({
        email: this.data.email
      });
      if (emailExists) {
        this.errors.push("That email is already taken");
      }
    }
    resolve();
  });
};

User.prototype.login = function() {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    usersCollection
      .findOne({ username: this.data.username })
      .then(attemptedUser => {
        if (
          attemptedUser &&
          bcrypt.compareSync(this.data.password, attemptedUser.password)
        ) {
          this.data = attemptedUser;
          this.getAvatar();
          resolve("congrats");
        } else {
          reject("invalid username or password");
        }
      })
      .catch(() => {
        reject("Please try again later");
      });
  });
};

User.prototype.register = function() {
  return new Promise(async (resolve, reject) => {
    // Validate user data
    this.cleanUp();
    await this.validate();
    // Only if there is no validation errors
    if (!this.errors.length) {
      // hash user password
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await usersCollection.insertOne(this.data);
      this.getAvatar();
      resolve();
    } else {
      reject(this.errors);
    }
    // Then save the user into a database
  });
};

User.prototype.getAvatar = function() {
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};

module.exports = User;
