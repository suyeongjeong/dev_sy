import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { contactService, Contact } from '../services/contactService';
import { smsService } from '../services/smsService';

export default function SendSMSScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const toggleContact = (id: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContacts(newSelected);
  };

  const selectAll = () => {
    const filteredContacts = getFilteredContacts();
    const allIds = new Set(filteredContacts.map(c => c.id!));
    setSelectedContacts(allIds);
  };

  const deselectAll = () => {
    setSelectedContacts(new Set());
  };

  const getFilteredContacts = () => {
    if (!searchQuery) return contacts;
    return contacts.filter(
      c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phoneNumber.includes(searchQuery)
    );
  };

  const handleSend = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('알림', '발송할 연락처를 선택해주세요.');
      return;
    }

    if (!message.trim()) {
      Alert.alert('알림', '메시지를 입력해주세요.');
      return;
    }

    Alert.alert(
      '발송 확인',
      `${selectedContacts.size}명에게 문자를 발송하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '발송',
          onPress: async () => {
            setSending(true);
            try {
              const phoneNumbers = contacts
                .filter(c => selectedContacts.has(c.id!))
                .map(c => c.phoneNumber);

              const result = await smsService.sendBulkSMS({
                phoneNumbers,
                message,
              });

              Alert.alert(
                '발송 완료',
                `총 ${result.totalSent}건 발송 성공\n${result.totalFailed}건 실패`,
                [
                  {
                    text: '확인',
                    onPress: () => {
                      setMessage('');
                      deselectAll();
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('오류', '문자 발송에 실패했습니다.');
            } finally {
              setSending(false);
            }
          },
        },
      ]
    );
  };

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.has(item.id!);
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={() => toggleContact(item.id!)}
      >
        <View style={styles.checkbox}>
          {isSelected && <Icon name="check" size={20} color="#2196F3" />}
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredContacts = getFilteredContacts();
  const messageLength = message.length;
  const smsCount = Math.ceil(messageLength / 70); // SMS는 보통 70자 기준

  return (
    <View style={styles.container}>
      <View style={styles.messageSection}>
        <Text style={styles.sectionTitle}>메시지 작성</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="메시지를 입력하세요"
          multiline
          value={message}
          onChangeText={setMessage}
          textAlignVertical="top"
        />
        <View style={styles.messageInfo}>
          <Text style={styles.messageLength}>
            {messageLength}자 / {smsCount}건
          </Text>
        </View>
      </View>

      <View style={styles.contactSection}>
        <View style={styles.contactHeader}>
          <Text style={styles.sectionTitle}>
            수신자 선택 ({selectedContacts.size}/{contacts.length})
          </Text>
          <View style={styles.selectButtons}>
            <TouchableOpacity onPress={selectAll} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>전체선택</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deselectAll} style={styles.selectButton}>
              <Text style={styles.selectButtonText}>선택해제</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="이름 또는 전화번호 검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={(item) => item.id!}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchQuery
                  ? '검색 결과가 없습니다.'
                  : '등록된 연락처가 없습니다.'}
              </Text>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.sendButton, sending && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={sending}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="send" size={20} color="#fff" />
            <Text style={styles.sendButtonText}>발송하기</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 120,
    fontSize: 16,
  },
  messageInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  messageLength: {
    fontSize: 14,
    color: '#666',
  },
  contactSection: {
    flex: 1,
    padding: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectButtons: {
    flexDirection: 'row',
  },
  selectButton: {
    marginLeft: 8,
    padding: 6,
  },
  selectButtonText: {
    color: '#2196F3',
    fontSize: 14,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  contactItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  contactItemSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#999',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
