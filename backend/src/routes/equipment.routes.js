import express from 'express';
import { EquipmentController } from '../controllers/equipment.controller.js';

const router = express.Router();

router.get('/', EquipmentController.getAll);
router.get('/:id', EquipmentController.getById);

export default router;
