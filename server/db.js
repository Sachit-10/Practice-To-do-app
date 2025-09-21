const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = mongoose.ObjectId


const User = new Schema({
  username:{type:String,unique:true},
  password:String
})

const TODO = new Schema({
  title:String,
  userId:ObjectId
})


const UserModel = mongoose.model("users",User)
const ToDoModel = mongoose.model("todos",TODO)

module.exports = {UserModel,ToDoModel}
