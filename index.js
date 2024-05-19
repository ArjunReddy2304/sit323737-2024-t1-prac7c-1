const express = require('express');
const winston = require('winston');
const { MongoClient } = require('mongodb');

// Initialize the Express application
const app = express();

// Middleware to serve static files from 'public' directory
app.use(express.static('public'));

// Middleware to parse JSON request bodies
app.use(express.json());

// MongoDB connection details
const uri = "mongodb://admin:password@mongo-service.default.svc.cluster.local:27017/SIT737?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Configure Winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-service' },
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Function to validate if input is a number
const validateNumber = (num) => !isNaN(parseFloat(num)) && isFinite(num);

// Connect to MongoDB and then start the server
client.connect((err) => {
    if (err) {
        logger.error("MongoDB Connection Error:", err);
        return;
    }
    logger.info("Connected to MongoDB!");

    const db = client.db('SIT737');
    const calculations = db.collection('calculations');

    // Function to log calculation results
    const logAndInsert = (operation, values, result, res) => {
        calculations.insertOne({ operation, ...values, result }, (err) => {
            if (err) {
                logger.error('Database Insert Error:', err);
                return res.status(500).send({ error: 'Database error.' });
            }
            res.json({ result });
        });
    };

    // Addition endpoint
    app.post('/add', (req, res) => {
        const { num1, num2 } = req.body;
        if (!validateNumber(num1) || !validateNumber(num2)) {
            logger.error('Invalid input numbers for addition');
            return res.status(400).send({ error: 'Inputs must be numbers.' });
        }
        const result = num1 + num2;
        logAndInsert('add', { num1, num2 }, result, res);
    });

    // Exponentiation endpoint
    app.post('/power', (req, res) => {
        const { num1, num2 } = req.body;
        if (!validateNumber(num1) || !validateNumber(num2)) {
            logger.error('Invalid input numbers for power operation');
            return res.status(400).send({ error: 'Inputs must be numbers.' });
        }
        const result = Math.pow(num1, num2);
        logAndInsert('power', { num1, num2 }, result, res);
    });

    // Square root endpoint
    app.post('/sqrt', (req, res) => {
        const { num } = req.body;
        if (!validateNumber(num)) {
            logger.error('Invalid input number for square root operation');
            return res.status(400).send({ error: 'Input must be a number.' });
        }
        const result = Math.sqrt(num);
        logAndInsert('sqrt', { num }, result, res);
    });

    // Modulo endpoint
    app.post('/mod', (req, res) => {
        const { num1, num2 } = req.body;
        if (!validateNumber(num1) || !validateNumber(num2)) {
            logger.error('Invalid input numbers for modulo operation');
            return res.status(400).send({ error: 'Inputs must be numbers.' });
        }
        const result = num1 % num2;
        logAndInsert('mod', { num1, num2 }, result, res);
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    // Starting the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        logger.info(`Server started on port ${PORT}`);
    });
});