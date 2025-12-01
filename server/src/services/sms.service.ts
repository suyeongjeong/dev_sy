import { getFirestore } from '../config/firebase';

export interface SendSMSRequest {
  phoneNumbers: string[];
  message: string;
  userId: string;
}

export interface SMSResult {
  phoneNumber: string;
  messageId?: string;
  status: 'success' | 'failed';
  error?: string;
}

// 인메모리 저장소 (데모용)
const mockHistory: any[] = [];

export class SMSService {
  private db = getFirestore();

  /**
   * 단일 SMS 발송 (Mock 모드)
   */
  async sendSingleSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      // 데모 모드: 실제 발송 없이 성공 응답 반환
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      // 시뮬레이션: 10% 확률로 실패
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        return {
          phoneNumber: formattedNumber,
          messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          status: 'success',
        };
      } else {
        return {
          phoneNumber: formattedNumber,
          status: 'failed',
          error: 'Simulated failure for demo',
        };
      }
    } catch (error: any) {
      console.error(`Failed to send SMS to ${phoneNumber}:`, error);
      return {
        phoneNumber,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * 대량 SMS 발송
   */
  async sendBulkSMS(request: SendSMSRequest): Promise<{
    results: SMSResult[];
    totalSent: number;
    totalFailed: number;
  }> {
    const results: SMSResult[] = [];

    // 각 전화번호로 SMS 발송
    for (const phoneNumber of request.phoneNumbers) {
      const result = await this.sendSingleSMS(phoneNumber, request.message);
      results.push(result);
    }

    const totalSent = results.filter(r => r.status === 'success').length;
    const totalFailed = results.filter(r => r.status === 'failed').length;

    // 발송 이력을 저장 (Mock 모드)
    await this.saveHistory({
      userId: request.userId,
      message: request.message,
      totalRecipients: request.phoneNumbers.length,
      totalSent,
      totalFailed,
      results,
      timestamp: new Date(),
    });

    return {
      results,
      totalSent,
      totalFailed,
    };
  }

  /**
   * 전화번호를 E.164 형식으로 변환
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // 한국 전화번호 처리
    let cleaned = phoneNumber.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    if (!cleaned.startsWith('+82')) {
      cleaned = '+82' + cleaned;
    }

    return cleaned;
  }

  /**
   * 발송 이력 저장
   */
  private async saveHistory(data: any): Promise<void> {
    try {
      if (this.db) {
        await this.db.collection('sms_history').add(data);
        console.log('✅ SMS history saved to Firestore');
      } else {
        // Mock 모드: 인메모리에 저장
        mockHistory.unshift({ ...data, id: `mock-${Date.now()}` });
        console.log('✅ SMS history saved to memory (Mock mode)');
      }
    } catch (error) {
      console.error('Failed to save SMS history:', error);
      // Mock으로 폴백
      mockHistory.unshift({ ...data, id: `mock-${Date.now()}` });
    }
  }

  /**
   * 발송 이력 조회
   */
  async getHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      if (this.db) {
        const snapshot = await this.db
          .collection('sms_history')
          .where('userId', '==', userId)
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get();

        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else {
        // Mock 모드: 인메모리에서 조회
        console.log('📝 Fetching history from memory (Mock mode)');
        return mockHistory
          .filter(h => h.userId === userId)
          .slice(0, limit);
      }
    } catch (error) {
      console.error('Failed to get SMS history:', error);
      // Mock으로 폴백
      return mockHistory
        .filter(h => h.userId === userId)
        .slice(0, limit);
    }
  }
}
