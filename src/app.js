const express = require('express');
const app = express()
const mongoose = require('mongoose');
const Post = require('./models/Post');
const User = require('./models/User');
const UserController = require('./controllers/User');
const PostCommentController = require('./controllers/PostComment');
const PostController = require('./controllers/Post');
const MessageController = require('./controllers/Message');
const PostLikeController = require('./controllers/PostLike');
const PostShareController = require('./controllers/PostShare');
const userAuth = require('../src/middlewares/userAuth');
const cors = require('cors');
const bcrypt = require('bcrypt')
const logger = require('./logger');

require('dotenv/config');


const password = process.env.DB_PASSWORD;
const dbuser = process.env.DB_USER;
const test_user_name = process.env.TEST_USER_NAME
const test_user2_name = process.env.TEST_USER2_NAME


app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))
app.use(cors())

app.use('/', UserController)
app.use('/', PostController)
app.use('/', MessageController)
app.use('/', PostCommentController)
app.use('/', PostShareController)
app.use('/', PostLikeController)
 
mongoose.set('useFindAndModify', false)
const uri = `mongodb+srv://${dbuser}:${password}@cluster0.4oubv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
mongoose.connect(uri,
  {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {}).catch(error => console.log(error))

app.use('/static', express.static('public'));


app.get('/test', async (req, res) => {
  return res.json({ola:'oi'})
})


app.post('/validate', userAuth, (req, res) => {
  return res.sendStatus(200)
})


/* Rotas de desenvolvimento. É preciso aumentar a segurança delas e impedir acesso indevido, hoje
elas estão soltinhas para qualquer um */
app.post('/configure', async (req, res) => {
  var message = req.body.extra;
  if (message == undefined) {message = ''}
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(test_user_name + message, salt)
  let newUser = new User({name:test_user_name + message, email:test_user_name + message, password:hash, username:test_user_name + message})
  await newUser.save()  

  salt = await bcrypt.genSalt(10);
  hash = await bcrypt.hash(test_user2_name + message, salt)
  let newUser2 = new User({name:test_user2_name + message, email:test_user2_name + message, password:hash, username:test_user2_name + message})
  await newUser2.save()  

  res.json({email:test_user_name + message, id:newUser._id, email:test_user2_name + message, id2:newUser2._id,}); 
})

app.post('/endconfigure', async (req, res) => {
  var message = req.body.extra;
  if (message == undefined) {message = ''}
  await User.deleteMany({email:test_user_name + message})
  await User.deleteMany({email:test_user2_name + message})
  return res.sendStatus(200)
})

app.delete('/user/:email', async (req, res) => {
  await User.deleteMany({email:req.params.email})
  return res.sendStatus(200)
})

app.delete('/user2/:id', async (req, res) => {
  await User.deleteMany({id:req.params.id})
  return res.sendStatus(200)
})

app.delete('/image', async (req, res) => {
  await Post.deleteMany({test:true})
  return res.sendStatus(200)
})

module.exports = { app, mongoose };
