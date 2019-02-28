const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
  notice there is no ID. That's because Mongoose will assign
  an ID by default to all schemas
*/

const PostSchema = new Schema({
  title: String,
  createdAt: Date,
  createdBy: Number,
  lastUpdatedAt: Date,
  lastUpdatedBy: Number,
  fields: [Mixed]
});

module.exports = mongoose.model("Post", PostSchema);
