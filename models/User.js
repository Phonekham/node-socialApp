const usersCollection = require("../db").collection("users");
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
};

User.prototype.register = function() {
  // Validate user data
  this.cleanUp();
  this.validate();
  // Only if there is no validation errors
  if (!this.errors.length) {
    usersCollection.insertOne(this.data);
  }
  // Then save the user into a database
};

module.exports = User;
