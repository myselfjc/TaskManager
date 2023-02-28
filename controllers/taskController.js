const AppError = require('../utils/AppError');
const Task = require('./../models/taskModel');
const catchAsync = require('./../utils/catchAsync');

exports.createTask = catchAsync(async (req,res,next)=>{
    const {date,task,status} = req.body;
        const newTask = await Task.create({
            date,
            task,
            status
        })
    res.status(200).json({
        status: 'Success',
        data: {
            newTask
        }
    })
});

exports.updateTask = catchAsync(async (req,res,next) => {
        const selectedTask = await Task.findByIdAndUpdate(req.params.id,req.body,{
            new: true
        });
        if(!selectedTask){
            return next(new AppError('Task not found in the database!!',404))
        }

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
        const selectedTask = await Task.findByIdAndDelete(req.params.id);
        if(!selectedTask){
            return next(new AppError('Task not found in the database!!',404))
        }
        res.status(200).json({
            status:'Success',
            message:'Task deleted successfully!',
            selectedTask
        })
    }
)

exports.getAllTasks = catchAsync(async (req,res,next) => {
        const tasks = await Task.find();
        if(!tasks){
            return next(new AppError(' No Task found in the database!!',404))
        }
        res.status(200).json({
            status:'Success',
            data:{
                tasks
            }
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