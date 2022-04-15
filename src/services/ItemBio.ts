import ItemBio from '@/models/ItemBio';

export default class ItemBioService {
  static async Create(typeItem, text, user) {
    const item = await new ItemBio({ typeItem, text, user });
    await item.save();
    return item;
  }

  static async DeleteAllItemBios(user) {
    return ItemBio.deleteMany({ user });
  }
}
