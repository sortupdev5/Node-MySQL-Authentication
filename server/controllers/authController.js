import prisma from '../lib/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (user) {
            return res.status(409).json({ message: "user already existed" })
        }
        const hashPassword = await bcrypt.hash(password, 10)
        await prisma.user.create({
            data: {
                username,
                email,
                password: hashPassword
            }
        })

        return res.status(201).json({ message: "user created successfully" })
    } catch (err) {
        return res.status(500).json(err.message)
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if (!user) {
            return res.status(404).json({ message: "user not existed" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: "wrong password" })
        }

        // Generate Access Token (short-lived)
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_KEY, { expiresIn: '15m' })

        // Generate Refresh Token (long-lived)
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_KEY, { expiresIn: '7d' })

        // Store Refresh Token in Database
        const session = await prisma.session.create({
            data: {
                refreshToken,
                userId: user.id
            }
        })
        console.log("Session created in database:", session.id);

        // Set Cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true, // Should be true in production
            sameSite: 'none',
            maxAge: 15 * 60 * 1000 // 15 minutes
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // Should be true in production
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        return res.status(201).json({
            message: "Login Successful",
            user: { id: user.id, username: user.username, email: user.email }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        })
        if (!user) {
            return res.status(404).json({ message: "user not existed" })
        }

        return res.status(201).json({ user: user })
    } catch (err) {
        return res.status(500).json({ message: "server error" })
    }
}
