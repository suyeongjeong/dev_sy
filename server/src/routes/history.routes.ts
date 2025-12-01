import express from 'express';
import { query, validationResult } from 'express-validator';
import { SMSService } from '../services/sms.service';

const router = express.Router();
const smsService = new SMSService();

/**
 * GET /api/history
 * 발송 이력 조회
 */
router.get(
  '/',
  [query('userId').isString().notEmpty().withMessage('User ID is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, limit } = req.query;
      const history = await smsService.getHistory(
        userId as string,
        limit ? parseInt(limit as string) : 50
      );
      res.json({
        success: true,
        data: history,
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
