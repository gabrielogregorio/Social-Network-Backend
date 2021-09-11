const User = require('../models/User');
const dataUser = require('../factories/dataUsers');

class UserService {
  async Create({name, email, username, hash, img}) {
    let newUser = new User({name, email, username, password:hash, img})
    await newUser.save()  
    return newUser;
  }

  async FindByListIds(ids){
    return await User.find({_id:{$in:ids}}).populate()
  }

  async FindById(id) {
    let user = await User.findById({_id:id}).populate('itemBio following followers')
    if (user != undefined) {
      return dataUser.Build(user)
    }
    return user;
  }

  async FindByIdRaw(id) {
    let user = await User.findById({_id:id})
    return user;
  }

  
  /*Retorna dados crus, precisa ser ajustado*/
  async FindByIdNotPopulate(id) {
    let user = await User.findById({_id:id})
    return user;
  }

  async FindByIdAndUpdate(id, update) {
    return await User.findOneAndUpdate({_id:id}, {$set:update})
  }

  async findFollowingUsers(id, includedUser=false) {
    let userItem = await this.FindById(id)
  
    let ids = dataUser.Build(userItem).followingIds;
    if (includedUser) {ids.push(id)}
    return await this.FindByListIds(ids)
  }

  async UserExistsByEmail(email) {
    return await User.findOne({email})
  }

  async FindUserByEmail(email) {
    return await User.findOne({email});
  }

  async FindAllUsers() {
    let users = await User.find().populate('itemBio following followers')

    let userFactories = []
    users.forEach(user => {
      userFactories.push(dataUser.Build(user))
    })

    return userFactories
  }


}

module.exports = new UserService();