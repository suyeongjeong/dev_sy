import express from 'express';
import { body, validationResult } from 'express-validator';
import { SMSService } from '../services/sms.service';

const router = express.Router();
const smsService = new SMSService();

/**
 * POST /api/sms/send
 * 대량 SMS 발송
 */
router.post(
  '/send',
  [
    body('phoneNumbers').isArray().notEmpty().withMessage('Phone numbers are required'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('userId').isString().notEmpty().withMessage('User ID is required'),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const result = await smsService.sendBulkSMS(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/sms/send-single
 * 단일 SMS 발송
 */
router.post(
  '/send-single',
  [
    body('phoneNumber').isString().notEmpty().withMessage('Phone number is required'),
    body('message').isString().notEmpty().withMessage('Message is required'),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phoneNumber, message } = req.body;
      const result = await smsService.sendSingleSMS(phoneNumber, message);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export default router;
