require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mainRouter = require('./src/routes/index_routes');
const errorHandler = require('./src/middlewares/error_middleware');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Để phục vụ file avatar
app.use('/api', mainRouter);
app.use(errorHandler);
app.use((req, res, next) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    const pool = require('./src/config/db.config');
    pool.getConnection()
        .then(connection => {
            console.log('Successfully connected to the database.');
            connection.release();
        })
        .catch(err => {
            console.error('Failed to connect to the database:', err.message);
        });
});