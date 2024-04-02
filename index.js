const express = require('express');
const winston = require('winston');

const app = express();
app.use(express.static('public'));

app.use(express.json());

// Configure logging
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

app.post('/add', (req, res) => {
    const { num1, num2 } = req.body;
    if (typeof num1 !== 'number' || typeof num2 !== 'number') {
        logger.error('Invalid input numbers for addition');
        return res.status(400).send({ error: 'Both inputs must be numbers.' });
    }
    const result = num1 + num2;
    logger.info(`Addition operation: ${num1} + ${num2} = ${result}`);
    res.send({ result });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    logger.info(`Server started on port ${PORT}`);
});
