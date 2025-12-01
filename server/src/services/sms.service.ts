import { getSNS } from '../config/aws';
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

export class SMSService {
  private sns = getSNS();
  private db = getFirestore();

  /**
   * 단일 SMS 발송
   */
  async sendSingleSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    try {
      // E.164 형식으로 전화번호 변환 (예: +821012345678)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      const params = {
        Message: message,
        PhoneNumber: formattedNumber,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional', // 또는 'Promotional'
          },
        },
      };

      const result = await this.sns.publish(params).promise();

      return {
        phoneNumber,
        messageId: result.MessageId,
        status: 'success',
      };
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

    // 발송 이력을 Firestore에 저장
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
      await this.db.collection('sms_history').add(data);
      console.log('✅ SMS history saved');
    } catch (error) {
      console.error('Failed to save SMS history:', error);
    }
  }

  /**
   * 발송 이력 조회
   */
  async getHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
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
    } catch (error) {
      console.error('Failed to get SMS history:', error);
      return [];
    }
  }
}
