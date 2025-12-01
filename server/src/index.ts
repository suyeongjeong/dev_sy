import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import smsRoutes from './routes/sms.routes';
import contactRoutes from './routes/contact.routes';
import historyRoutes from './routes/history.routes';
import { initializeFirebase } from './config/firebase';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // 데모 페이지를 위해 비활성화
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 데모 페이지 정적 파일 서빙
app.use('/demo', express.static(path.join(__dirname, '../../demo')));

// Initialize Firebase
initializeFirebase();

// Routes
app.use('/api/sms', smsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/history', historyRoutes);

// 루트 경로 - 데모 페이지로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/demo/index.html');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  console.log(`📱 SMS Service ready with AWS SNS`);
  console.log(`🌐 Demo page available at http://localhost:${PORT}/demo/index.html`);
});
