import { api, CURRENT_USER_ID } from '../config/api';

export interface Contact {
  id?: string;
  name: string;
  phoneNumber: string;
  email?: string;
  group?: string;
  userId?: string;
}

export const contactService = {
  // 연락처 목록 조회
  async getContacts(group?: string): Promise<Contact[]> {
    const response = await api.get('/contacts', {
      params: { userId: CURRENT_USER_ID, group },
    });
    return response.data.data;
  },

  // 연락처 추가
  async createContact(contact: Contact): Promise<Contact> {
    const response = await api.post('/contacts', {
      ...contact,
      userId: CURRENT_USER_ID,
    });
    return response.data.data;
  },

  // 연락처 수정
  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    await api.put(`/contacts/${id}`, updates);
  },

  // 연락처 삭제
  async deleteContact(id: string): Promise<void> {
    await api.delete(`/contacts/${id}`);
  },

  // 대량 연락처 추가
  async bulkCreateContacts(contacts: Contact[]): Promise<void> {
    await api.post('/contacts/bulk', {
      contacts: contacts.map(c => ({ ...c, userId: CURRENT_USER_ID })),
    });
  },
};
