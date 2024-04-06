const express = require('express');
const winston = require('winston');

// Initialize the Express application
const app = express();

// Middleware to serve static files from 'public' directory
app.use(express.static('public'));

// Middleware to parse JSON request bodies
app.use(express.json());

// Configure Winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple()
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// Function to validate if input is a number
const validateNumber = (num) => !isNaN(parseFloat(num)) && isFinite(num);

// Addition endpoint
app.post('/add', (req, res) => {
    const { num1, num2 } = req.body;
    if (!validateNumber(num1) || !validateNumber(num2)) {
        logger.error('Invalid input numbers for addition');
        return res.status(400).send({ error: 'Inputs must be numbers.' });
    }
    const result = num1 + num2;
    res.json({ result });
});

// Exponentiation endpoint
app.post('/power', (req, res) => {
    const { num1, num2 } = req.body;
    if (!validateNumber(num1) || !validateNumber(num2)) {
        logger.error('Invalid input numbers for power operation');
        return res.status(400).send({ error: 'Inputs must be numbers.' });
    }
    const result = Math.pow(num1, num2);
    res.json({ result });
});

// Square root endpoint
app.post('/sqrt', (req, res) => {
    const { num } = req.body;
    if (!validateNumber(num)) {
        logger.error('Invalid input number for square root operation');
        return res.status(400).send({ error: 'Input must be a number.' });
    }
    const result = Math.sqrt(num);
    res.json({ result });
});

// Modulo endpoint
app.post('/mod', (req, res) => {
    const { num1, num2 } = req.body;
    if (!validateNumber(num1) || !validateNumber(num2)) {
        logger.error('Invalid input numbers for modulo operation');
        return res.status(400).send({ error: 'Inputs must be numbers.' });
    }
    const result = num1 % num2;
    res.json({ result });
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.info(`Server started on port ${PORT}`);
});
