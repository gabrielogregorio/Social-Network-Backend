import ItemBio, { ItemBioSchema } from '@/models/ItemBio';
import { rowsAffectedInterface } from 'src/interfaces/delete';

export default class ItemBioService {
  static async Create(typeItem: string, text: string, user: string): Promise<ItemBioSchema> {
    const item = await new ItemBio({ typeItem, text, user });
    await item.save();
    return item;
  }

  static async DeleteAllItemBios(user: string): Promise<rowsAffectedInterface> {
    const { deletedCount } = await ItemBio.deleteMany({ user });
    return { rowsAffected: deletedCount };
  }
}
