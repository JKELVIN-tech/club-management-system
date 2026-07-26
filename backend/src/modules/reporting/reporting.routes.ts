import { Router } from 'express';
import * as controller from './reporting.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN, Role.SECRETARY, Role.TREASURER));

router.get('/overview', controller.overview);
router.get('/membership', controller.membership);
router.get('/financial', controller.financial);
router.get('/events', controller.events);

export default router;
