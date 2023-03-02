const AppError = require('../utils/AppError');
const Task = require('./../models/taskModel');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

exports.createTask = catchAsync(async (req,res,next)=>{
    const {date,task,status} = req.body;
    const user = req.user;
        const newTask = await Task.create({
            date,
            task,
            status,
            user:user._id
        })
        if(!user.tasks){
            user.tasks = []
        }
        user.tasks.push(newTask);
        await user.save({validateBeforeSave:false});
        res.status(200).json({
            newTask,
            user
        })
    
});

exports.updateTask = catchAsync(async (req,res,next) => {
    if(!(req.user.tasks.includes(req.params.id))) {
        return next(new AppError('Task not found for the user',404));
    }
    const selectedTask = await Task.findByIdAndUpdate(req.params.id,req.body,{
        new:true
    });
    res.status(200).json({
        status:'Success',
        message:'Task updated successfully!!',
        data:{
            selectedTask
        }
    })          
    }
)

exports.deleteTask = catchAsync(async (req,res,next) =>{
        if(!(req.user.tasks.includes(req.params.id))) {
            return next(new AppError('Task not found for the user',404));
        }
        const selectedTask = await Task.findByIdAndDelete(req.params.id);
        req.user.tasks.pop(req.params.id);
        req.user.save({validateBeforeSave:false});
        res.status(200).json({
            status:'Success',
            message:'Task deleted successfully!',
            selectedTask
        })
    }
)

exports.getAllTasks = catchAsync(async (req,res,next) => {
        let query = Task.find().where('user').equals(req.user._id);
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 3;
        const skip = (page - 1) * limit;
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(" ");
            query = query.sort(sortBy);
        }
        query = query.skip(skip).limit(limit);
        // const user = await User.findOne({_id : req.user._id}).populate({path:'tasks',select:'-__v -user'});
        const tasks = await query;
        res.status(200).json({
            status:'Success',
            tasks:tasks  
        })}
)


// exports.getSortedTasks = async (req,res)=>{
//     try{

//         console.log(req.query);
//         let query = Task.find(req.query);

//         if(req.query.sort){
//             query = query.sort(req.query.sort);
//         }
//         const tasks = await Task.find(query);
        
//         if(!tasks){
//             res.status(404).json({
//                 status:'Failed',
//                 message:'There is no task at the moment!'
//             })
//         }
//         res.status(200).json({
//             status:'Success',
//             data:{
//                 tasks
//             }
//         })
//     }catch(err){
//         res.status(400).json({
//             status:'Failed',
//             message:'Couldnt fetch the tasks!',
//             err
//         })
//     }
// }