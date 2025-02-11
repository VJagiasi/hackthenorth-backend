/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: API for managing event activities.
 */

import { Router } from 'express';
import { createActivity, getActivities, getActivityById, updateActivityOneScan } from '../controllers/activityController';

const router = Router();

/**
 * @swagger
 * /activities:
 *   post:
 *     summary: Create a new activity
 *     description: Adds a new activity to the system.
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Opening Ceremony"
 *               category:
 *                 type: string
 *                 example: "Ceremony"
 *     responses:
 *       201:
 *         description: Activity successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Opening Ceremony"
 *                 category:
 *                   type: string
 *                   example: "Ceremony"
 *       400:
 *         description: Invalid input or activity creation failed.
 */
router.post('/', createActivity);

/**
 * @swagger
 * /activities:
 *   get:
 *     summary: Retrieve all activities
 *     description: Fetches a list of all registered activities.
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: Successfully retrieved activities.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Opening Ceremony"
 *                   category:
 *                     type: string
 *                     example: "Ceremony"
 *       500:
 *         description: Failed to retrieve activities.
 */
router.get('/', getActivities);

/**
 * @swagger
 * /activities/{id}:
 *   get:
 *     summary: Get activity details by ID
 *     description: Fetches detailed information about a specific activity, including associated scans.
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the activity.
 *     responses:
 *       200:
 *         description: Activity details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Opening Ceremony"
 *                 category:
 *                   type: string
 *                   example: "Ceremony"
 *                 scans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                         example: 10
 *                       scanned_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-02-11T10:15:30.000"
 *       404:
 *         description: Activity not found.
 *       500:
 *         description: Failed to retrieve activity.
 */
router.get('/:id', getActivityById);

/**
 * @swagger
 * /activities/{activity_name}/one-scan:
 *   put:
 *     summary: Restrict an activity to one scan per user
 *     description: Updates an activity to enforce a "one scan only" rule.
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: activity_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the activity to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - one_scan_only
 *             properties:
 *               one_scan_only:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully updated activity.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Opening Ceremony"
 *                 category:
 *                   type: string
 *                   example: "Ceremony"
 *                 one_scan_only:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid request body.
 *       404:
 *         description: Activity not found.
 *       500:
 *         description: Internal server error.
 */
router.put("/:activity_name/one-scan", updateActivityOneScan);

export default router;