const express = require('express');
const router = express.Router()
const userAuth = require('../middlewares/userAuth');
const LikeService = require('../services/Like')
const PostService = require('../services/Post');
const { processId } = require('../util/textProcess');
require('dotenv/config');


router.post('/post/like/:id', userAuth,  async (req, res) => { 
  var id = processId(req.params.id);
  var user = processId(req.data.id);
  try {
    var likeExistente = await LikeService.FindLike(id, user)

    if (likeExistente != null) {
      await LikeService.DeleteLike(id, user)

      var post = await PostService.FindById(id)
 
      post.likes = post.likes.filter(value => value != `${likeExistente._id}`)
      await post.save();
  
      return res.json({includeLike: false})  
    }
  } catch(error) {
    return res.sendStatus(500)
  }

  try {
    var newLike = await LikeService.Create(id, user)
    var post = await PostService.FindById(id)

    post.likes.push(newLike)
    await post.save();

    return res.json({includeLike: true})
  } catch(error)  {
    console.log(error)
    return res.sendStatus(500)
  }
})

module.exports = router;
