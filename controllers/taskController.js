const AppError = require('../utils/AppError');
const Task = require('./../models/taskModel');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

exports.createTask = catchAsync(async (req, res, next) => {
    const { date, task, status } = req.body;
    const user = req.user;

    const length = user.tasks.length;
    const newTask = await Task.create({
        date,
        task,
        status,
        sequence:length+1,
        user: user._id
    })

    user.tasks.push(newTask);
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        newTask
    })
});

exports.updateTask = catchAsync(async (req, res, next) => {
    if (!(req.user.tasks.includes(req.params.id))) return next(new AppError('Task not found for the user', 404));

    const selectedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    });

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
    if (!(req.user.tasks.includes(req.params.id))) return next(new AppError('Task not found for the user', 404));

    const selectedTask = await Task.findByIdAndDelete(req.params.id);

    req.user.tasks.pop(req.params.id);
    req.user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'Success',
        message: 'Task deleted successfully!',
        selectedTask
    })
}
)

exports.getAllTasks = catchAsync(async (req, res, next) => {
    let query = Task.find({user:req.user._id}).sort('sequence');

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 3;
    const skip = (page - 1) * limit;

    if(skip>req.user.tasks.length) return next(new AppError('No Task found in this page!', 404));

    query = query.skip(skip).limit(limit);

    const tasks = await query;

    res.status(200).json({
        status: 'Success',
        tasks: tasks
    })
}
)


exports.getSortedTasks = catchAsync (async(req,res,next) =>{
    const currentTasks = await Task.find({user:req.user._id}).sort('sequence');

    const {newSequence} = req.body;

    if(!(currentTasks.length == newSequence.length)) return next(new AppError('Please enter valid new Sequence!', 404));

    for(let i=0;i<currentTasks.length;i++){
        if(newSequence[i] == currentTasks[i].sequence) continue;
        currentTasks[i].sequence = newSequence[i];
        await currentTasks[i].save();
    }

    res.status(200).json({
        status:"Success",
        data:{
            currentTasks
        }
    })
});


