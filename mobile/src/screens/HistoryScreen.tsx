import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { smsService } from '../services/smsService';

interface HistoryItem {
  id: string;
  message: string;
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  timestamp: any;
  results: any[];
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await smsService.getHistory(50);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
    } catch (error) {
      return '날짜 정보 없음';
    }
  };

  const openDetail = (item: HistoryItem) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const successRate =
      item.totalRecipients > 0
        ? ((item.totalSent / item.totalRecipients) * 100).toFixed(1)
        : 0;

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => openDetail(item)}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{successRate}% 성공</Text>
          </View>
        </View>

        <Text style={styles.historyMessage} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.historyStats}>
          <View style={styles.stat}>
            <Icon name="people" size={16} color="#666" />
            <Text style={styles.statText}>
              총 {item.totalRecipients}명
            </Text>
          </View>
          <View style={styles.stat}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.statText}>
              {item.totalSent}건 성공
            </Text>
          </View>
          {item.totalFailed > 0 && (
            <View style={styles.stat}>
              <Icon name="error" size={16} color="#f44336" />
              <Text style={styles.statText}>
                {item.totalFailed}건 실패
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>발송 이력</Text>
        <TouchableOpacity onPress={loadHistory}>
          <Icon name="refresh" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={loadHistory}
          ListEmptyComponent={
            <Text style={styles.emptyText}>발송 이력이 없습니다.</Text>
          }
        />
      )}

      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>발송 상세 정보</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>발송 시간</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedItem.timestamp)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>메시지</Text>
                  <Text style={styles.detailValue}>{selectedItem.message}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>발송 통계</Text>
                  <Text style={styles.detailValue}>
                    총 {selectedItem.totalRecipients}명 / 성공{' '}
                    {selectedItem.totalSent}건 / 실패 {selectedItem.totalFailed}
                    건
                  </Text>
                </View>

                {selectedItem.results && selectedItem.results.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>상세 결과</Text>
                    {selectedItem.results.map((result, index) => (
                      <View key={index} style={styles.resultItem}>
                        <Icon
                          name={
                            result.status === 'success'
                              ? 'check-circle'
                              : 'error'
                          }
                          size={16}
                          color={
                            result.status === 'success' ? '#4CAF50' : '#f44336'
                          }
                        />
                        <Text style={styles.resultPhone}>
                          {result.phoneNumber}
                        </Text>
                        {result.error && (
                          <Text style={styles.resultError}>{result.error}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
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
  loader: {
    marginTop: 50,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  historyMessage: {
    fontSize: 16,
    marginBottom: 12,
  },
  historyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultPhone: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  resultError: {
    marginLeft: 8,
    fontSize: 12,
    color: '#f44336',
    flex: 1,
  },
});
