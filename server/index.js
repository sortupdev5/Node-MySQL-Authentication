import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/authRoutes.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swaggerConfig.js'

const app = express()

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://16.170.211.97", // <-- add this
    "https://node-my-sql-authentication-fa7v.vercel.app",
    "https://node-my-sql-authentication.vercel.app",
    "http://localhost:5173"
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log("Origin not allowed by CORS:", origin);
            return callback(new Error('The CORS policy for this site does not ' +
                'allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))


app.use(cookieParser())
app.use(express.json())

// Swagger UI configuration for Vercel
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css";
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
}))
app.use('/auth', authRouter)
app.get('/', (req, res) => {
    res.send("Server is Running");
})

const PORT = process.env.PORT || 5001;
const HOST = '0.0.0.0'; // Listen on all interfaces

app.listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app