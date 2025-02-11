import { Router } from 'express';
import { createActivity, getActivities, getActivityById, updateActivityOneScan } from '../controllers/activityController';

const router = Router();

router.post('/', createActivity);
router.get('/', getActivities);
router.get('/:id', getActivityById);
router.put("/:activity_name/one-scan", updateActivityOneScan);

export default router;