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

Follow.prototype.validate = async function(action) {
  // followedUsername must exist in database
  let followedAccount = await userCollections.findOne({
    username: this.followedUsername
  });
  if (followedAccount) {
    this.followedId = followedAccount._id;
  } else {
    this.errors.push("That user does not exist");
  }

  let doesFollowAlreadyExist = await followCollections.findOne({
    followedId: this.followedId,
    authorId: new ObjectID(this.authorId)
  });
  if (action == "create") {
    if (doesFollowAlreadyExist) {
      this.errors.push("You already follow this user");
    }
  }
  if (action == "delete") {
    if (!doesFollowAlreadyExist) {
      this.errors.push("You can't stop follow if you are not follow");
    }
  }

  //   Should not follow yourself
  if (this.followedId.equals(this.authorId)) {
    this.errors.push("you can not follow yourself");
  }
};

Follow.prototype.create = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate("create");
    if (!this.errors.length) {
      await followCollections.insertOne({
        followedId: this.followedId,
        authorId: new ObjectID(this.authorId)
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.prototype.delete = function() {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate("delete");
    if (!this.errors.length) {
      await followCollections.deleteOne({
        followedId: this.followedId,
        authorId: new ObjectID(this.authorId)
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.isVisitorFollowing = async function(followedId, visitorId) {
  let followDoc = await followCollections.findOne({
    followedId: followedId,
    authorId: new ObjectID(visitorId)
  });
  if (followDoc) {
    return true;
  } else {
    return false;
  }
};

module.exports = Follow;
