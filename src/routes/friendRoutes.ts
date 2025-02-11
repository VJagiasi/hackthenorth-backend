/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Manage friend connections by scanning badges at events.
 */

import { Router } from "express";
import { scanFriend, getScannedFriends } from "../controllers/friendController";

const router = Router();

/**
 * @swagger
 * /friends/scan/{badge_code}:
 *   post:
 *     summary: Scan a friend's badge
 *     description: Allows a user to scan another person's badge to establish a connection.
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: badge_code
 *         required: true
 *         schema:
 *           type: string
 *         description: The badge_code of the **scanner** (the person scanning the badge).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friend_badge_code
 *             properties:
 *               friend_badge_code:
 *                 type: string
 *                 description: The badge_code of the **friend being scanned**.
 *     responses:
 *       200:
 *         description: Successfully scanned a friend's badge.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully scanned John's badge."
 *                 scanned_at:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-02-11T14:23:34.000"
 *       400:
 *         description: Bad request (e.g., invalid badge code, already scanned).
 *       403:
 *         description: User must be checked in to scan a friend.
 *       404:
 *         description: One or both users not found.
 */
router.post("/scan/:badge_code", scanFriend);

/**
 * @swagger
 * /friends/{badge_code}:
 *   get:
 *     summary: Retrieve all scanned friends
 *     description: Fetches a list of all friends a user has scanned.
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: badge_code
 *         required: true
 *         schema:
 *           type: string
 *         description: The badge_code of the user requesting the list of scanned friends.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of scanned friends.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Alice Johnson"
 *                   email:
 *                     type: string
 *                     example: "alice@example.com"
 *                   phone:
 *                     type: string
 *                     example: "+1 123-456-7890"
 *                   badge_code:
 *                     type: string
 *                     example: "apple-orange-banana-grape"
 *                   scanned_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-02-11T14:25:01.000"
 *       404:
 *         description: User not found.
 */
router.get("/:badge_code", getScannedFriends);

export default router;