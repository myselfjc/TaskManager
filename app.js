const express = require('express');
const userRoutes = require('./routes/userRoutes'); 
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(express.json());

app.use('/api/v1/users',userRoutes);
app.use('/api/v1/tasks',taskRoutes);

module.exports = app;


