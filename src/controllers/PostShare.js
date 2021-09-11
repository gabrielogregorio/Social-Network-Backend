const express = require('express');
const router = express.Router()
const userAuth = require('../middlewares/userAuth');
const PostService = require('../services/Post');
const { processId } = require('../util/textProcess');
require('dotenv/config');


// Compartilha um post
router.post('/post/share/:id', userAuth, async(req, res) => {
  var user = processId(req.data.id)
  var idPost = processId(req.params.id)

  // Cria o novo post referenciando o post que será compartilhado
  var newPostSave = PostService.Create({user, sharePost:idPost})

  // Ainda é preciso arrumar uma forma de remover
  // essa referência quando o post novo for deletado, porém,
  // não é minha prioridade esse detalhe
  // Atualiza o post original com a referência do novo post
  let sharedPost = await PostService.FindById(idPost);
  sharedPost.thisReferencesShared.push(newPostSave._id)
  await sharedPost.save()

  res.json({_id: newPostSave._id, user, shared:idPost})
})

module.exports = router;
