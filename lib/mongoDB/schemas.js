const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/*
  notice there is no ID. That's because Mongoose will assign
  an ID by default to all schemas
*/

const TypeSchema = new Schema({
  name: String,
  description: String,
  fields: [Mixed]
});

// Define the schema for each post type with fields
const ModelSchema = new Schema({
  name: String,
  description: String,
  createdAt: Date,
  createdBy: Number,
  lastUpdatedAt: Date,
  lastUpdatedBy: Number,
  fields: [Mixed]
});

module.exports = mongoose.model("Model", ModelSchema);
/*
{
  name: 'PostReference',
  description: 'Status object for tranfers',
  fields: [{
    status: Enum<Draft, Progress, Done>,
    isAborted: Boolean
  }]
},
{
  name: 'Status',
  description: 'Status object for tranfers',
  fields: [{
    status: Enum<Draft, Progress, Done>,
    isAborted: Boolean
  }]
},
{
  name: 'Transfer',
  description: 'manages property transfers',
  fields: [{
    status: Status
  }]
}
--

new Transfer
  title: ''
  status: {
    statusMessage
  }
*/
