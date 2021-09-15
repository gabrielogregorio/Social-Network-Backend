
require('dotenv/config');
const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const userAuth = require('../middlewares/userAuth');
const router = express.Router()
const ItemBioService = require('../services/ItemBio')
const jwtSecret = process.env.JWT_SECRET
const { processId } = require('../util/textProcess');
const userService = require('../services/User');
const { body, validationResult } = require('express-validator');
const logger = require('../logger');
const {format} = require('util');
const { bucket } = require('./bucket')
const { uuid } = require('uuidv4');

const Multer = require('multer');
const { FindPostsByUser, DeleteAllPostByUser } = require('../services/Post');
const { DeleteUserById } = require('../services/User');
const { DeleteAllSave } = require('../services/SavePosts');
const { DeleteAllLikes } = require('../services/Like');
const { DeleteAllComments } = require('../services/Comment');
const { DeleteAllMessages } = require('../services/Message');
const { DeleteAllItemBios } = require('../services/ItemBio');

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});


router.post('/userLoadFile', userAuth, multer.single('image'), async(req, res, next) => {
  logger.debug('Load image user')
  user = processId(req.data.id)

  if (!req.file || user === undefined) {
    res.status(400).send('No file uploaded.');
    return;
  }
  const blob = bucket.file(`${Date.now().toString()}-${uuid()}`);
  const blobStream = blob.createWriteStream();
  
  blobStream.on('error', err => {
    next(err);
  });
  
  blobStream.on('finish', () => {
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    res.json({file:publicUrl})
  });
  blobStream.end(req.file.buffer);  
})

/* Cria um usuário */
router.post('/user', 
    body('name').isLength({ min: 2, max:50 }),
    body('username').isLength({ min: 2, max:50 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5, max:50 }),
    async (req, res) => {

  logger.info(`try create user ${req.body.email}`)
  let {name, email, username, password} = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let user = await userService.UserExistsByEmail(req.body.email)
    if (user != undefined) {
      res.statusCode = 409;
      return res.json({error: 'E-mail já cadastrado!'})
    }

    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(password, salt)

    let newUser = await userService.Create({name, email, username, hash})

    jwt.sign({email: newUser.email, name:newUser.name, id: newUser._id}, jwtSecret, {expiresIn: '24h'}, (error, token) => {
      if (error) {
        return res.sendStatus(500)
      } else {  
        return res.json({token, email:email, id:newUser._id}); 
        
      }
    })
  } catch(error) {
    res.sendStatus(500);
  }
})


/* Cria um usuário */
router.delete('/user', userAuth, async (req, res) => {
  let idUser = req.data.id
  await DeleteAllPostByUser(idUser)
  await DeleteUserById(idUser)
  await DeleteAllSave(idUser)
  await DeleteAllLikes(idUser)
  await DeleteAllComments(idUser)
  await DeleteAllMessages(idUser)
  await DeleteAllItemBios(idUser)
  return res.sendStatus(200)
})
 


router.post('/auth', async (req, res) => {
  let {email, password} = req.body;

  let user = await userService.FindUserByEmail(email)

  if(user == undefined) {
    return res.sendStatus(404)
  }

  let valid = await bcrypt.compare(password, user.password);
  if(!valid) {
    return res.sendStatus(403)
  } 

  jwt.sign({email, name:user.name, id: user._id}, jwtSecret, {expiresIn: '24h'}, (error, token) => {
    if (error) {
      return res.sendStatus(500)
    }
    return res.json({token, id: user._id})
  })
})


router.get('/users', userAuth,  async (req, res) => { 
  let users = await userService.FindAllUsers()
  return res.json(users);
})


router.get('/user/:id', userAuth,  async (req, res) => { 
  let user;
  try {
    user = await userService.FindById(req.params.id)
  } catch(error) {
    return res.sendStatus(500)
  }

  if (user == undefined) {
    return res.sendStatus(404)
  }

  return res.json([user]);
})
 

router.put('/user/:id', userAuth, async (req, res) => { 
  let {name, username, password, itemBio, bio, motivational, img} = req.body;
  let id = processId(req.params.id)
  let user = processId(req.data.id)
  let updatePassword;
  
  if (id != `${user}`) {
    // Só pode alterar a si mesmo
    return res.sendStatus(403)
  }
  if (
    (name == '' || id == '' || username == '') ||
    (name == undefined || id == undefined || username == undefined)
    ){
    return res.sendStatus(400);
  }

  if (password == '' || password == undefined) {
    updatePassword = false;
  } else {
    updatePassword = true;
  }
  
  if (img == undefined) {
    img = ''
  }

  let update = {}
  let salt = '';
  let hash = '';
  try {
    if (updatePassword) {
      salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password, salt)
      update = {name, password:hash, username}
    } else {
      update = {name, username}
    }

    if (img != '') {
      update.img = img
    }

    // Tem frase de motivação
    if (motivational != '' && motivational != undefined) {
      update.motivational = motivational
    }

    // Tem nova bio
    if (bio != '' && bio != undefined) {
      update.bio = bio
    }

    // Tem novos items para a bio
    if (itemBio != '' && itemBio != undefined) {
      update.itemBio = []

      // Loop para adicionar os novos itens
      for (let i = 0; i < itemBio.length; i++) {
        // Relaciona os itens com o usuário
        
        let item = await ItemBioService.Create(itemBio[i][0], itemBio[i][1], id)
        await update.itemBio.push(item._id)
      }
    }

    // Atualiza o perfil do usuário
    await userService.FindByIdAndUpdate(id, update)
    
    // retorna os dados atualizados!
    let userNew = await userService.FindById(id)

    if (userNew == null) {
      return res.sendStatus(404)      
    }
    return res.json(userNew)
  } catch(error)  {
    return res.sendStatus(500)
  } 
})


router.post('/user/follow/:id', userAuth, async (req, res) => {
  let idUserToken = processId(req.data.id)
  let idUserFollow = processId(req.params.id)

  if (idUserToken == idUserFollow) {
    res.statusCode = 400
    return res.json({msg: 'Usuário não pode seguir a si mesmo!'})
  }
 
  try {
    // Encontra o usuário que quer seguir e o usuário que será seguido
    let userFollow = await userService.FindByIdNotPopulate(idUserFollow)
    let user = await userService.FindByIdNotPopulate(idUserToken)

    // Algum usuário não encontrado
    if (userFollow == '' || user == '' || userFollow == null || user == null){
      return res.sendStatus(404)
    }

    // Verifica se o usuário que quer seguir já está seguindo o outro usuário
    let filterFollonUser = user.following.filter(item => item._id != idUserFollow)

    // Usuário NÃO estava seguindo
    if (filterFollonUser.length == user.following.length) {
      // Atualizar ambos os lados
      user.following.push(userFollow._id)
      userFollow.followers.push(user._id)

      await user.save()
      await userFollow.save()  

      return res.json({followed:true})

    // unfolow
    } else {

      // Atualizar ambos os lados
      user.following = filterFollonUser
      let filterRemoveFollon = user.followers.filter(item => item._id != idUserToken)
      userFollow.followers = filterRemoveFollon

      await user.save()
      await userFollow.save()  
      return res.json({followed:false})
    }
  } catch(error) {
    return res.sendStatus(500)
  }
});


router.get('/me', userAuth,  async (req, res) => { 
  id = processId(req.data.id)

  let user =  await userService.FindById(id)

  if (user == undefined) {
    res.statusCode = 404
    return res.json({msg: 'Identificador do usuário não encontrado'})
  }

  return res.json([user]);
})

module.exports = router;
