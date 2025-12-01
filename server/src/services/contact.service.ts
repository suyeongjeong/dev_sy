import { getFirestore } from '../config/firebase';

export interface Contact {
  id?: string;
  name: string;
  phoneNumber: string;
  email?: string;
  group?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ContactService {
  private db = getFirestore();
  private collection = 'contacts';

  /**
   * 연락처 추가
   */
  async createContact(contact: Contact): Promise<Contact> {
    try {
      const docRef = await this.db.collection(this.collection).add({
        ...contact,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        id: docRef.id,
        ...contact,
      };
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  }

  /**
   * 연락처 목록 조회
   */
  async getContacts(userId: string, group?: string): Promise<Contact[]> {
    try {
      let query = this.db
        .collection(this.collection)
        .where('userId', '==', userId);

      if (group) {
        query = query.where('group', '==', group);
      }

      const snapshot = await query.get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Contact));
    } catch (error) {
      console.error('Failed to get contacts:', error);
      throw error;
    }
  }

  /**
   * 연락처 수정
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    try {
      await this.db
        .collection(this.collection)
        .doc(id)
        .update({
          ...updates,
          updatedAt: new Date(),
        });
    } catch (error) {
      console.error('Failed to update contact:', error);
      throw error;
    }
  }

  /**
   * 연락처 삭제
   */
  async deleteContact(id: string): Promise<void> {
    try {
      await this.db.collection(this.collection).doc(id).delete();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  }

  /**
   * 대량 연락처 추가 (CSV/Excel 업로드용)
   */
  async bulkCreateContacts(contacts: Contact[]): Promise<number> {
    try {
      const batch = this.db.batch();
      let count = 0;

      contacts.forEach(contact => {
        const docRef = this.db.collection(this.collection).doc();
        batch.set(docRef, {
          ...contact,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        count++;
      });

      await batch.commit();
      return count;
    } catch (error) {
      console.error('Failed to bulk create contacts:', error);
      throw error;
    }
  }
}
