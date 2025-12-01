import { api, CURRENT_USER_ID } from '../config/api';

export interface SendSMSRequest {
  phoneNumbers: string[];
  message: string;
}

export interface SMSResult {
  phoneNumber: string;
  messageId?: string;
  status: 'success' | 'failed';
  error?: string;
}

export interface SendSMSResponse {
  results: SMSResult[];
  totalSent: number;
  totalFailed: number;
}

export const smsService = {
  // 대량 SMS 발송
  async sendBulkSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
    const response = await api.post('/sms/send', {
      ...request,
      userId: CURRENT_USER_ID,
    });
    return response.data.data;
  },

  // 단일 SMS 발송
  async sendSingleSMS(phoneNumber: string, message: string): Promise<SMSResult> {
    const response = await api.post('/sms/send-single', {
      phoneNumber,
      message,
    });
    return response.data.data;
  },

  // 발송 이력 조회
  async getHistory(limit?: number): Promise<any[]> {
    const response = await api.get('/history', {
      params: { userId: CURRENT_USER_ID, limit },
    });
    return response.data.data;
  },
};
