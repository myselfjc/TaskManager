const AppError = require('../utils/AppError');
const Task = require('./../models/taskModel');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

exports.createTask = catchAsync(async (req, res, next) => {
    // Destructuring the body into variables
    const { date, task, status } = req.body;

    // req.user will have the logged in User's details from the protect route. Storing it back into user variable
    const user = req.user;

    // storing the length of logged in User's tasks
    const length = user.tasks.length;


    const newTask = await Task.create({
        date,
        task,
        status,
        sequence:length+1,
        user: user._id
    })

    // Storing the task to User's data - tasks array and saving it
    user.tasks.push(newTask);
    await user.save({ validateBeforeSave: false });

    // sending the success response
    res.status(200).json({
        newTask
    })
});

exports.updateTask = catchAsync(async (req, res, next) => {
    // checking if the mentioned task id is present in the User's data or not
    if (!(req.user.tasks.includes(req.params.id))) return next(new AppError('Task not found for the user', 404));

    // fetching the task from the data and updating it
    const selectedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    });

    // sending the success response
    res.status(200).json({
        status: 'Success',
        message: 'Task updated successfully!!',
        data: {
            selectedTask
        }
    })
}
)

exports.deleteTask = catchAsync(async (req, res, next) => {
    // checking if the mentioned task id is present in the User's data or not
    if (!(req.user.tasks.includes(req.params.id))) return next(new AppError('Task not found for the user', 404));

    // fetching the task from the data and deleting it
    const selectedTask = await Task.findByIdAndDelete(req.params.id);

    // removing the deleted task from User's data
    req.user.tasks.pop(req.params.id);
    req.user.save({ validateBeforeSave: false });

    // sending the success response
    res.status(200).json({
        status: 'Success',
        message: 'Task deleted successfully!',
        selectedTask
    })
}
)

exports.getAllTasks = catchAsync(async (req, res, next) => {
    // Fetching the User's tasks and sorting it according to its sequence
    let query = Task.find({user:req.user._id}).sort('sequence');

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 3;
    const skip = (page - 1) * limit;

    if(skip>req.user.tasks.length) return next(new AppError('No Task found in this page!', 404));

    // updating the query with pagination
    query = query.skip(skip).limit(limit);

    const tasks = await query;

    // sending the success response
    res.status(200).json({
        status: 'Success',
        tasks: tasks
    })
}
)


exports.getSortedTasks = catchAsync (async(req,res,next) =>{
    // Fetching the User's tasks and sorting it according to its sequence
    const currentTasks = await Task.find({user:req.user._id}).sort('sequence');

    // fetching the new sequence of User's tasks array specified by User from body
    const {newSequence} = req.body;

    if(!(currentTasks.length == newSequence.length)) return next(new AppError('Please enter valid new Sequence!', 404));

    // Updating the new sequence of tasks and saving them to User's data
    for(let i=0;i<currentTasks.length;i++){
        if(newSequence[i] == currentTasks[i].sequence) continue;
        currentTasks[i].sequence = newSequence[i];
        await currentTasks[i].save();
    }

    // sending the success response
    res.status(200).json({
        status:"Success",
        data:{
            currentTasks
        }
    })
});


