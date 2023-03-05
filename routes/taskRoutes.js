const express = require('express');
const router = express.Router();
const taskController = require('./../controllers/taskController');
const authController = require('./../controllers/authController');

router
    .route('/')
    .get(authController.protect,taskController.getAllTasks)
    .post(authController.protect,taskController.createTask)
    .put(authController.protect,taskController.getSortedTasks);

router
    .route('/:id')
    .patch(authController.protect,taskController.updateTask)
    .delete(authController.protect,taskController.deleteTask);

module.exports = router;