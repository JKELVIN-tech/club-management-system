import { Router } from 'express';
import * as controller from './members.controller';
import { authenticate, authorize, authorizeSelfOrRoles } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Admin/Secretary can list all members and view membership stats
router.get('/', authorize(Role.ADMIN, Role.SECRETARY, Role.TREASURER), controller.list);
router.get('/stats', authorize(Role.ADMIN, Role.SECRETARY), controller.stats);

// Any member can view/edit their own profile; Admin/Secretary can view/edit anyone's
router.get('/:id', authorizeSelfOrRoles(Role.ADMIN, Role.SECRETARY, Role.TREASURER), controller.getById);
router.patch('/:id', authorizeSelfOrRoles(Role.ADMIN, Role.SECRETARY), controller.updateProfile);

// Only Admin/Secretary can change membership status or roles
router.patch('/:id/status', authorize(Role.ADMIN, Role.SECRETARY), controller.updateStatus);
router.patch('/:id/role', authorize(Role.ADMIN), controller.updateRole);

// Only Admin can hard-delete a member record
router.delete('/:id', authorize(Role.ADMIN), controller.remove);

export default router;
