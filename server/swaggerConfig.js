import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Auth API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Node.js + Prisma Authentication Server',
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development server',
            },
            {
                url: 'https://node-my-sql-authentication.vercel.app',
                description: 'Vercel Production server',
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [
        path.join(__dirname, './routes/*.js'),
        path.join(__dirname, './controllers/*.js')
    ], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
