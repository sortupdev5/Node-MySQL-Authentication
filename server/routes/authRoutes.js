import express from 'express'
import jwt from 'jsonwebtoken'
import { register, login, getUser } from '../controllers/authController.js'

const router = express.Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The user's username
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: User already exists
 *       500:
 *         description: Server error
 */
router.post('/register', register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       201:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized - wrong password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/login', login)

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken; // Updated from 'token'
        if (!token) {
            return res.status(401).json({ message: "No Token Provided" })
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        req.userId = decoded.id;
        next()
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Access token expired" })
        }
        return res.status(500).json({ message: "server error" })
    }
}

/**
 * @swagger
 * /auth/home:
 *   get:
 *     summary: Get user profile info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: User profile retrieved
 *       403:
 *         description: No token provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/home', verifyToken, getUser)

export default router;