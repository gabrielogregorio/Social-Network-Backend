const Save = require('../models/Save');

class SavePostsService {
  async Create(post, user) {
    var newSave = new Save({post, user});
    await newSave.save();  
    return newSave
  }

  async FindByUser (user) {
    return await Save.find({user});
  }

  async DeleteOne(post, user) {
    return await Save.deleteOne({post, user});
  }

  async FindOne(post, user) {
    return await Save.findOne({post, user});
  }
}

module.exports = new SavePostsService()