const userCollections = require("../db")
  .db()
  .collection("users");
const followCollections = require("../db")
  .db()
  .collection("follows");
const ObjectID = require("mongodb").ObjectID;

let Follow = function(followedUsername, authorId) {
  this.followedUsername = followedUsername;
  this.authorId = authorId;
  this.errors = [];
};

Follow.prototype.cleanUp = function() {
  if (typeof this.followedUsername != "string") this.followedUsername = "";
};

Follow.prototype.validate = async function() {
  // followedUsername must exist in database
  let followedAccount = await userCollections.findOne({
    username: this.followedUsername
  });
  if (followedAccount) {
    this.followId = followedAccount._id;
  } else {
    this.errors.push("That user does not exist");
  }
};

Follow.prototype.create = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate();
    if (!this.errors.length) {
      await followCollections.insertOne({
        followId: this.followId,
        authorId: new ObjectID(this.authorId)
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

module.exports = Follow;
