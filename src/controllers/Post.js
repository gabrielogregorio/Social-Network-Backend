const express = require('express');
const router = express.Router()
const DataPosts = require('../factories/dataPosts');
const multerImagePosts = require('../middlewares/multerImagePosts');
const userAuth = require('../middlewares/userAuth');
const SavePostsService = require('../services/SavePosts')
const PostService = require('../services/Post');
const { processId } = require('../util/textProcess');
const UserService = require('../services/User')
require('dotenv/config');

router.post('/postLoadFile', userAuth, multerImagePosts.single('image'), async(req, res) => {
  var user = processId(req.data.id)

  if (user == undefined || user == '') { return res.sendStatus(400) }

  if (req.file) {
    img = req.file['filename']
  } else {
    img = ''
  }

  return res.json({file:img})
})


router.post('/post', userAuth, async(req, res) => {
  let { body, test, img} = req.body;

  let user = processId(req.data.id)
  
  if ( body == '' ||body == undefined || user == undefined || user == '') {
      return res.sendStatus(400)
  }

  if (img == undefined) {
    img = ''
  }
  if (test == undefined) {
    test = false;
  }

  try {
    var newPostSave = await PostService.Create({body, user, test, img}) 
    res.json({_id: newPostSave._id, user})
  } catch(error) {

    res.statusCode = 500;
    res.json({msg: "Usuário não registrado na base de dados!"})
  }
})


router.get('/posts', userAuth, async (req, res) => {
  var user = processId(req.data.id)
  if ( user == undefined || user == '') { return res.sendStatus(400) }

  var posts = await PostService.findFollowingPosts(user, true)
  var saves = await SavePostsService.FindByUser(user);
 
  var idSavedByUser = []
  saves.forEach(item => {
    idSavedByUser.push(item.post)
  })

  var postFactories = []
  posts.forEach(async post => {
    postFactories.push(DataPosts.Build(post, user, idSavedByUser))
  })

  res.statusCode = 200
  res.json(postFactories) 
})
 

router.get('/post/:id', userAuth, async (req, res) => {
  var user = processId(req.data.id)
  try {
    var posts = await PostService.FindByIdAndPopulate(req.params.id)
  } catch(error) {
    return res.sendStatus(500)
  }

  if (posts.length == 0) {
    return res.sendStatus(404)
  }

  var saves = await SavePostsService.FindByUser(user);
  var idSavedByUser = []
  saves.forEach(item => {
    idSavedByUser.push(item.post)
  })

  var postFactories = []
  posts.forEach(post => {
    postFactories.push(DataPosts.Build(post, user, idSavedByUser))
  })
  return res.json(postFactories) 
})


router.put('/post/:id', userAuth,  async (req, res) => { 
  var {body, img} = req.body;
  var id = processId(req.params.id)
  var user = processId(req.data.id)
  
  if (body == '' || body == undefined || id == undefined || user == undefined){
    return res.sendStatus(400);
  }

  var upload = {body}

  if (img != '') {
    upload.img = img
  }
 
  try {
    await PostService.FindOneAndUpdate(id, user, upload)
    var post = await PostService.FindOne(id, user)
    if (post == null || post == undefined) {
      return res.sendStatus(403)
    }
    return res.json(post)
  } catch(error)  {
    return res.sendStatus(500)
  } 
})


router.post('/post/save/:id', userAuth,  async (req, res) => { 
  var id = processId(req.params.id)
  var user = processId(req.data.id)
  try {
    var saveExists = await SavePostsService.FindOne(id, user)
    
    if (saveExists != null) {
      await SavePostsService.DeleteOne(id, user)
      var user = await UserService.FindByIdRaw(user)  
      user.saves = user.saves.filter(value => value != `${saveExists._id}`)
      await user.save();
  
      return res.json({includeSave: false})  
    }
  } catch(error) {
    return res.sendStatus(500)
  }

  try {
    var newSave = await SavePostsService.Create(id, user)

    var user = await UserService.FindByIdRaw(user)

    user.saves.push(newSave)
    await user.save();

    return res.json({includeSave: true})
  } catch(error)  {
    return res.sendStatus(500)
  }
}) 
 

router.get('/post/list/save', userAuth,  async (req, res) => { 
  var user = processId(req.data.id);
  var saves = await SavePostsService.FindByUser(user)
  var ids = []
  saves.forEach(item => {
    ids.push(item.post)
  })
  let posts = await PostService.FindPostsByIds(user, ids)

  return res.json(posts);
})

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


router.delete('/post/:id', userAuth, async (req, res) => {
  var id = processId(req.params.id)

  try {
    var resDelete = await PostService.DeleteById(id)
    if (resDelete.deletedCount == 1) {
      res.sendStatus(200)
    } else {
      res.sendStatus(404)
    }
  } catch(error ) {
    res.sendStatus(500)
  }
})

router.get('/posts/user/:id', userAuth, async (req, res) => {
  let user = processId(req.params.id) 
  let userCall = processId(req.data.id)
  if ( user == undefined ) { return res.sendStatus(400) }
 
  try {
    let userItem = await UserService.FindById(user)
    let ids = DataUsers.Build(userItem).followingIds;
    ids.push(user) // Próprio usuário
  
    let posts = await PostService.FindPostsByUser(user)
  
    let saves = await SavePostsService.FindByUser(user)
    let idSavedByUser = []
    saves.forEach(item => {
      idSavedByUser.push(item.post)
    })
  
    let postFactories = []
    posts.forEach(post => {
      postFactories.push(DataPosts.Build(post, userCall, idSavedByUser))
    }) 
  
    res.statusCode = 200
    res.json(postFactories)   
  } catch(error) {
    return res.sendStatus(500)
  }
})

module.exports = router;
