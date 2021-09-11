const express = require('express');
const router = express.Router()
const userAuth = require('../middlewares/userAuth');
const PostService = require('../services/Post');
const CommentService = require('../services/Comment')
const { processId } = require('../util/textProcess');
require('dotenv/config');


// Sistema de comentários
router.get('/post/comments/:id', userAuth,  async (req, res) => { 
  var id = processId(req.params.id);
  var comments = await CommentService.FindByPosts(id)
  return res.json(comments);
})

router.post('/post/comment/:id', userAuth,  async (req, res) => { 
  var id = processId(req.params.id);
  var user = processId(req.data.id);
  var replie = req.body.replie;
  var text = req.body.text;

  if (text == '' || id == '' || user == '' || id == undefined || user == undefined || text == undefined) {
    return res.sendStatus(400)
  }
  try {
    if (replie  != undefined) {
      var newComment = await CommentService.Create({post: id, user, text, replie})

      var originalComment = await CommentService.FindById(replie)
      originalComment.replies.push(newComment)
      await originalComment.save();
  
      return res.json({id:newComment.id, replie:originalComment._id})  
    } else {
      var newComment = await CommentService.Create({post: id, user, text, base: true})
  
      var post = await PostService.FindById(id)
      post.comments.push(newComment)
      await post.save();
  
      return res.json({id:newComment.id})  
    }
  } catch(error)  {
    return res.sendStatus(500)
  }
})


router.delete('/post/comment/:idComment', userAuth,  async (req, res) => { 
  var id = processId(req.params.idComment)
  var user = processId(req.data.id)

  if ( id == undefined || user == undefined ) {
    return res.sendStatus(400)
  }

  try {
     await CommentService.DeleteOne(id, user)
    return res.sendStatus(200)
  } catch(error)  {
    return res.sendStatus(500)
  }
})


router.put('/post/comment/:idComment', userAuth,  async (req, res) => { 
  var id = processId(req.params.idComment)
  var user = processId(req.data.id)
  var text = req.body.text;

  if (text == '' || id == '' || user == '' || id == undefined || user == undefined || text == undefined) {
    return res.sendStatus(400)
  }

  try {
    var comment = await CommentService.FindOneAndUpdate(id, user, {text})
    if (comment == null) {
      return res.sendStatus(404)
    }

    return res.json({oi:'ola'})
  } catch(error)  {
    return res.sendStatus(500)
  }
})

module.exports = router;
