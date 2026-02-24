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
        const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, { expiresIn: '3h' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 3 * 60 * 60 * 1000 // 3 hours
        })


        return res.status(201).json({ message: "Login Successful" })
    } catch (err) {
        return res.status(500).json(err.message)
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
