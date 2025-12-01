import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import smsRoutes from './routes/sms.routes';
import contactRoutes from './routes/contact.routes';
import historyRoutes from './routes/history.routes';
import { initializeFirebase } from './config/firebase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase
initializeFirebase();

// Routes
app.use('/api/sms', smsRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/history', historyRoutes);

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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 SMS Service ready with AWS SNS`);
});
