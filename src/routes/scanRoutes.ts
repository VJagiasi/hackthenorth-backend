import { Router } from "express";
import { addScan, getScansByTime, getScansData } from "../controllers/scanController";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Scans
 *     description: The Scans API allows you to track user activity at events by logging scans of their unique badges. This includes recording user check-ins for specific activities, retrieving scan data, and analyzing attendance trends over time.
 *     x-order: 2
 */

/**
 * @swagger
 * /scan/{badge_code}:
 *   post:
 *     tags: [Scans]
 *     summary: Add a new scan for a user
 *     description: Logs a scan entry for a user, recording their participation in an activity.
 *     parameters:
 *       - in: path
 *         name: badge_code
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's unique badge code.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity_name:
 *                 type: string
 *                 description: The name of the activity.
 *               activity_category:
 *                 type: string
 *                 description: The category of the activity.
 *     responses:
 *       200:
 *         description: Scan successfully recorded.
 *       400:
 *         description: Invalid request parameters.
 *       403:
 *         description: User is checked out.
 *       404:
 *         description: User or activity not found.
 *       429:
 *         description: Scan cooldown time exceeded.
 */
router.post("/:badge_code", addScan);

/**
 * @swagger
 * /scan:
 *   get:
 *     tags: [Scans]
 *     summary: Retrieve scan statistics
 *     description: Fetches aggregated scan data, including activity participation counts.
 *     parameters:
 *       - in: query
 *         name: min_frequency
 *         schema:
 *           type: integer
 *         description: Minimum scan frequency.
 *       - in: query
 *         name: max_frequency
 *         schema:
 *           type: integer
 *         description: Maximum scan frequency.
 *       - in: query
 *         name: activity_category
 *         schema:
 *           type: string
 *         description: Filter by activity category.
 *     responses:
 *       200:
 *         description: Successfully retrieved scan data.
 *       400:
 *         description: Invalid request parameters.
 *       404:
 *         description: No scan data found.
 */
router.get("/", getScansData);

/**
 * @swagger
 * /scan/timeline:
 *   get:
 *     tags: [Scans]
 *     summary: Retrieve scan data over time
 *     description: Returns scan counts grouped by time intervals (hour, minute, day).
 *     parameters:
 *       - in: query
 *         name: activity_name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the activity.
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [minute, hour, day]
 *         description: The time interval for grouping.
 *       - in: query
 *         name: start_time
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The start time for filtering.
 *       - in: query
 *         name: end_time
 *         schema:
 *           type: string
 *           format: date-time
 *         description: The end time for filtering.
 *     responses:
 *       200:
 *         description: Successfully retrieved scan timeline.
 *       400:
 *         description: Invalid request parameters.
 *       404:
 *         description: No scan data found.
 */
router.get("/timeline", getScansByTime);

export default router;