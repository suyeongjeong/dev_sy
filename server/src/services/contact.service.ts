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

// 인메모리 저장소 (데모용)
let mockContacts: Contact[] = [];
let mockIdCounter = 1;

export class ContactService {
  private db = getFirestore();
  private collection = 'contacts';

  /**
   * 연락처 추가
   */
  async createContact(contact: Contact): Promise<Contact> {
    try {
      const now = new Date();
      const contactWithTimestamps = {
        ...contact,
        createdAt: now,
        updatedAt: now,
      };

      if (this.db) {
        const docRef = await this.db.collection(this.collection).add(contactWithTimestamps);
        return {
          id: docRef.id,
          ...contactWithTimestamps,
        };
      } else {
        // Mock 모드
        const newContact = {
          id: `mock-${mockIdCounter++}`,
          ...contactWithTimestamps,
        };
        mockContacts.push(newContact);
        console.log('✅ Contact created in memory (Mock mode)');
        return newContact;
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
      // Mock으로 폴백
      const newContact = {
        id: `mock-${mockIdCounter++}`,
        ...contact,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockContacts.push(newContact);
      return newContact;
    }
  }

  /**
   * 연락처 목록 조회
   */
  async getContacts(userId: string, group?: string): Promise<Contact[]> {
    try {
      if (this.db) {
        let query = this.db
          .collection(this.collection)
          .where('userId', '==', userId);

        if (group) {
          query = query.where('group', '==', group) as any;
        }

        const snapshot = await query.get();

        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Contact));
      } else {
        // Mock 모드
        console.log('📝 Fetching contacts from memory (Mock mode)');
        let filtered = mockContacts.filter(c => c.userId === userId);
        if (group) {
          filtered = filtered.filter(c => c.group === group);
        }
        return filtered;
      }
    } catch (error) {
      console.error('Failed to get contacts:', error);
      // Mock으로 폴백
      let filtered = mockContacts.filter(c => c.userId === userId);
      if (group) {
        filtered = filtered.filter(c => c.group === group);
      }
      return filtered;
    }
  }

  /**
   * 연락처 수정
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    try {
      if (this.db) {
        await this.db
          .collection(this.collection)
          .doc(id)
          .update({
            ...updates,
            updatedAt: new Date(),
          });
      } else {
        // Mock 모드
        const index = mockContacts.findIndex(c => c.id === id);
        if (index !== -1) {
          mockContacts[index] = {
            ...mockContacts[index],
            ...updates,
            updatedAt: new Date(),
          };
          console.log('✅ Contact updated in memory (Mock mode)');
        }
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
      // Mock으로 폴백
      const index = mockContacts.findIndex(c => c.id === id);
      if (index !== -1) {
        mockContacts[index] = {
          ...mockContacts[index],
          ...updates,
          updatedAt: new Date(),
        };
      }
    }
  }

  /**
   * 연락처 삭제
   */
  async deleteContact(id: string): Promise<void> {
    try {
      if (this.db) {
        await this.db.collection(this.collection).doc(id).delete();
      } else {
        // Mock 모드
        mockContacts = mockContacts.filter(c => c.id !== id);
        console.log('✅ Contact deleted from memory (Mock mode)');
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
      // Mock으로 폴백
      mockContacts = mockContacts.filter(c => c.id !== id);
    }
  }

  /**
   * 대량 연락처 추가 (CSV/Excel 업로드용)
   */
  async bulkCreateContacts(contacts: Contact[]): Promise<number> {
    try {
      const now = new Date();

      if (this.db) {
        const batch = this.db.batch();
        let count = 0;

        contacts.forEach(contact => {
          const docRef = this.db!.collection(this.collection).doc();
          batch.set(docRef, {
            ...contact,
            createdAt: now,
            updatedAt: now,
          });
          count++;
        });

        await batch.commit();
        return count;
      } else {
        // Mock 모드
        contacts.forEach(contact => {
          mockContacts.push({
            id: `mock-${mockIdCounter++}`,
            ...contact,
            createdAt: now,
            updatedAt: now,
          });
        });
        console.log(`✅ ${contacts.length} contacts created in memory (Mock mode)`);
        return contacts.length;
      }
    } catch (error) {
      console.error('Failed to bulk create contacts:', error);
      // Mock으로 폴백
      const now = new Date();
      contacts.forEach(contact => {
        mockContacts.push({
          id: `mock-${mockIdCounter++}`,
          ...contact,
          createdAt: now,
          updatedAt: now,
        });
      });
      return contacts.length;
    }
  }
}
