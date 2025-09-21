const express = require('express');
const app = express();
app.use(express.json());

const jwt = require('jsonwebtoken')
const JWT_SECRET = 'ilovekiara'

const zod = require('zod')
const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
const { UserModel, ToDoModel } = require('./db');
mongoose.connect("mongodb://localhost:27017/todo-app-database")

const cors = require('cors')
const corsOptions = {
  origin: 'http://localhost:3000',         // only allow your React dev server
  methods: ['GET','POST','PUT','DELETE'],  // methods you use
  allowedHeaders: [
    'token','Content-Type'          // ← explicitly allow your custom header
  ],
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));


app.post('/signup', async function(req,res) {
  
  try {
  const username = req.body.username
  const password = req.body.password

  const hashedPassword = await bcrypt.hash(password,5)

  await UserModel.create({
    username:username,
    password:hashedPassword
  })

  res.json({
    message:"Successfully signed up"
  })
} catch (e){
  res.json({
    message:"User already exist or something went wrong"
  })
}



})

app.post("/signin", async function(req,res){

  const username = req.body.username
  const password = req.body.password

  const user = await UserModel.findOne({
    username:username
  })

  if(!user){
    res.json({
      message:"No user found"
    })
  }

  const passwordMatch = await  bcrypt.compare(password,user.password)

  if(passwordMatch){

    const token = jwt.sign({
      id:user._id.toString()
    },JWT_SECRET)

    res.json({
      message:"You are successgully signed in",
      token:token,
      userId:user._id.toString()
    })
  }
  else {
    res.json({
      message: "Wrong credentials."
    })
  }
 
})


app.post('/createTodo',auth,async function(req,res){

  const title = req.body.title

  console.log("req.userId:", req.userId); // <-- Add this for debug
   
  await ToDoModel.create({
    userId:req.userId,
    title:title
  })

  res.json({
    messgae:"TODO inserted successfully"
  })
})

app.get('/getAll', auth,async function(req,res) {
  userId = req.userId;

  const todos = await ToDoModel.find({
   userId
  })

  
    res.json({
      todos
    })
  

})


app.post("/delete",auth, async function(req,res){
  const todoId = req.body.id

  const checkId = await ToDoModel.findById(
    todoId
  )

  if(checkId){

    await ToDoModel.findByIdAndDelete(
      todoId
    )

    res.json({
      message:"Todo deleted successfuly"
    })
  }
  else {
    res.json({
      message:"This todo dont exist"
    })
  }
})


function auth (req,res,next) {
  const token = req.headers.token
  const decodedInfo = jwt.verify(token,JWT_SECRET);

  if(decodedInfo){
    const userId = decodedInfo.id
    req.userId = userId
    next()
  }
  else {
    res.json({
      message:"User not found"
    })
  }
}






app.listen(8082)


