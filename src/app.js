require('dotenv/config');
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

mongoose.connect(
  process.env.DB_MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {}).catch(error => console.log(error))


app.post('/validate', userAuth, (req, res) => {
  return res.sendStatus(200)
})

app.get('/', (req, res) => {
  res.send('API is Running')
})

app.delete('/user/:email', async (req, res) => {
  try {
    await User.deleteMany({email:req.params.email})
    return res.sendStatus(200)  
  } catch(error) {
    return res.sendStatus(200)
  }
})

app.delete('/image', async (req, res) => {
  try {
    await Post.deleteMany({test:true})
    return res.sendStatus(200)
  } catch(error) {
    return res.sendStatus(200)
}
})

module.exports = { app, mongoose };
