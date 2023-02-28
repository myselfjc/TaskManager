const express = require('express');
const router = express.Router();
const taskController = require('./../controllers/taskController');
const authController = require('./../controllers/authController');

router.route('/createTask').post(authController.protect,taskController.createTask);
router.route('/updateTask/:id').patch(authController.protect,taskController.updateTask);
router.route('/deleteTask/:id').delete(authController.protect,taskController.deleteTask);
router.route('/getAllTasks').get(authController.protect,taskController.getAllTasks);
// router.route('/getSortedTasks').get(taskController.getSortedTasks);

module.exports = router;