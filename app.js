const express = require('express');
const userRoutes = require('./routes/userRoutes'); 
const taskRoutes = require('./routes/taskRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(express.json());


// Routing
app.use('/api/v1/users',userRoutes);
app.use('/api/v1/tasks',taskRoutes);


// Handling the unhandled Routes
app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server!`,404));
})


// Global Error Handler
app.use(globalErrorHandler);



module.exports = app;


