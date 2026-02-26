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
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_KEY, { expiresIn: '15s' })

        // Generate Refresh Token (long-lived)
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_KEY, { expiresIn: '7d' })

        // Store Refresh Token in Database
        const session = await prisma.session.create({
            data: {
                refreshToken,
                userId: user.id
            }
        })

        // Set Cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 1000 // 15 minutes
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
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
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No Refresh Token Provided" })
        }

        // Verify Refresh Token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY)

        // Check if session exists in database
        const session = await prisma.session.findUnique({
            where: { refreshToken }
        })

        if (!session) {
            return res.status(401).json({ message: "Invalid Session" })
        }

        // Generate New Access Token
        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_KEY, { expiresIn: '15s' })

        // Set New Access Token Cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 15 * 1000 // 15 seconds
        })

        return res.status(200).json({ message: "Token Refreshed Successfully" })
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Refresh token expired" })
        }
        return res.status(500).json({ message: "internal server error" })
    }
}
