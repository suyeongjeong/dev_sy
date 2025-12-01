import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { contactService, Contact } from '../services/contactService';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<Contact>({
    name: '',
    phoneNumber: '',
    email: '',
    group: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await contactService.getContacts();
      setContacts(data);
    } catch (error) {
      Alert.alert('오류', '연락처를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phoneNumber) {
      Alert.alert('알림', '이름과 전화번호를 입력해주세요.');
      return;
    }

    try {
      if (editingContact?.id) {
        await contactService.updateContact(editingContact.id, formData);
      } else {
        await contactService.createContact(formData);
      }
      setModalVisible(false);
      resetForm();
      loadContacts();
    } catch (error) {
      Alert.alert('오류', '저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('삭제 확인', '이 연락처를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await contactService.deleteContact(id);
            loadContacts();
          } catch (error) {
            Alert.alert('오류', '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const openAddModal = () => {
    resetForm();
    setEditingContact(null);
    setModalVisible(true);
  };

  const openEditModal = (contact: Contact) => {
    setFormData(contact);
    setEditingContact(contact);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      group: '',
    });
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
        {item.email && <Text style={styles.contactEmail}>{item.email}</Text>}
        {item.group && (
          <Text style={styles.contactGroup}>그룹: {item.group}</Text>
        )}
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Icon name="edit" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id!)}
        >
          <Icon name="delete" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>연락처 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id!}
        refreshing={loading}
        onRefresh={loadContacts}
        ListEmptyComponent={
          <Text style={styles.emptyText}>등록된 연락처가 없습니다.</Text>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingContact ? '연락처 수정' : '연락처 추가'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="이름"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="전화번호 (예: 01012345678)"
              value={formData.phoneNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, phoneNumber: text })
              }
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="이메일 (선택)"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="그룹 (선택)"
              value={formData.group}
              onChangeText={(text) => setFormData({ ...formData, group: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  contactEmail: {
    fontSize: 14,
    color: '#666',
  },
  contactGroup: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#999',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
