const ItemBio = require('../models/ItemBio');

class ItemBioService {
  async Create(typeItem, text, user) {
    let item = await new ItemBio({typeItem, text, user});
    await item.save()
    return item;
  }

  async DeleteAllItemBios(user) {
    return await ItemBio.deleteMany({user});
  }
}

module.exports = new ItemBioService()
