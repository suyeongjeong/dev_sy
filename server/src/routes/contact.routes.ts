import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { ContactService } from '../services/contact.service';

const router = express.Router();
const contactService = new ContactService();

/**
 * POST /api/contacts
 * 연락처 추가
 */
router.post(
  '/',
  [
    body('name').isString().notEmpty().withMessage('Name is required'),
    body('phoneNumber').isString().notEmpty().withMessage('Phone number is required'),
    body('userId').isString().notEmpty().withMessage('User ID is required'),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const contact = await contactService.createContact(req.body);
      res.json({
        success: true,
        data: contact,
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
 * GET /api/contacts
 * 연락처 목록 조회
 */
router.get(
  '/',
  [query('userId').isString().notEmpty().withMessage('User ID is required')],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, group } = req.query;
      const contacts = await contactService.getContacts(
        userId as string,
        group as string | undefined
      );
      res.json({
        success: true,
        data: contacts,
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
 * PUT /api/contacts/:id
 * 연락처 수정
 */
router.put('/:id', async (req: express.Request, res: express.Response) => {
  try {
    await contactService.updateContact(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Contact updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/contacts/:id
 * 연락처 삭제
 */
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    await contactService.deleteContact(req.params.id);
    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/contacts/bulk
 * 대량 연락처 추가
 */
router.post('/bulk', async (req: express.Request, res: express.Response) => {
  try {
    const count = await contactService.bulkCreateContacts(req.body.contacts);
    res.json({
      success: true,
      message: `${count} contacts created successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
