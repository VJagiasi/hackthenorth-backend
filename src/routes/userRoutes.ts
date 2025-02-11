import { Router } from "express";
import { getAllUsers, getUserByEmail, updateUser, checkInUser, checkOutUser } from "../controllers/userController";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management and information retrieval
 *     x-order: 1
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users along with their scans.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", getAllUsers);

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Get user details
 *     description: Fetch user details by email.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user.
 *     responses:
 *       200:
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 */
router.get("/:email", getUserByEmail);

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Update user details
 *     description: Updates user information by email.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               badge_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request body.
 *       404:
 *         description: User not found.
 */
router.put("/:email", updateUser);

/**
 * @swagger
 * /users/{email}/check-in:
 *   post:
 *     summary: Check-in a user
 *     description: Marks a user as checked-in.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user.
 *     responses:
 *       200:
 *         description: User successfully checked in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: User already checked in or invalid request.
 *       404:
 *         description: User not found.
 */
router.post("/:email/check-in", checkInUser);

/**
 * @swagger
 * /users/{email}/check-out:
 *   post:
 *     summary: Check-out a user
 *     description: Marks a user as checked-out.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user.
 *     responses:
 *       200:
 *         description: User successfully checked out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: User already checked out or invalid request.
 *       404:
 *         description: User not found.
 */
router.post("/:email/check-out", checkOutUser);

export default router;