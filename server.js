import dotenv from 'dotenv';
dotenv.config();

import express from "express";
const app = express();
import path, { dirname } from 'path';
import { logEvents, logger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import cors from 'cors'
import { corsOptions } from "./config/corsOptions.js";
import connectDB from './config/dbConn.js';
import mongoose from 'mongoose';
const PORT = process.env.PORT || 3500;

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(process.env.NODE_ENV);

connectDB();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', await import('./routes/root.js').then(m => m.default));
app.use('/auth', await import('./routes/authRoutes.js').then(m => m.default));
app.use('/users', await import('./routes/userRoutes.js').then(m => m.default));
app.use('/notes', await import('./routes/noteRoutes.js').then(m => m.default));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ message: "404 Not Found" });
    } else {
        res.type('txt').send('404 Not Found');
    }
})

app.use(errorHandler);
mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', err => {
    console.log('err: ', err);
    logEvents(`${err.ok}: ${err.code}\t${err.codeName}\t${err.connectionGeneration}`, 'dbErrLog.log');
})
