import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/authRoutes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swaggerConfig.js'

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
}))


app.use(cookieParser())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/auth', authRouter)
app.get('/', (req, res) => {
    res.send("Server is Running");
})

if (process.env.NODE_ENV !== 'production') {
    app.listen(process.env.PORT || 5001, () => {
        console.log("Server is  Running")
    })
}

export default app