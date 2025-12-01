import axios from 'axios';

// 백엔드 서버 URL (실제 배포 시 수정 필요)
const API_BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 현재 사용자 ID (실제 앱에서는 인증 시스템 구현 필요)
export const CURRENT_USER_ID = 'user_001';
