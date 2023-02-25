const Task = require('./../models/taskModel');

exports.createTask = async (req,res)=>{
    const {date,task,status} = req.body;
    try{
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
}catch(err){
    res.status(404).json({
        status: 'Failed',
        message:'There is some error while creating the task!!'
    })
}
}

exports.updateTask = async (req,res) => {
    try{
        const selectedTask = await Task.findByIdAndUpdate(req.params.id,req.body,{
            new: true
        });

        res.status(200).json({
            status:'Success',
            message:'Task updated successfully!!',
            data:{
                selectedTask
            }
        })  
    }catch(err){
        res.status(404).json({
            status: 'Failed',
            message:'Please enter a valid task ID',
            err
        })
    }
}

exports.deleteTask = async (req,res) =>{
    try{
        const selectedTask = await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status:'Success',
            message:'Task deleted successfully!'
        })
    }catch(err){
        res.status(400).json({
            status:'Failed',
            message:'Please enter valid task ID'
        })
    }
}