const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true  
    },
    task: {
        type: String,
        required:true,
        minlength: 10,
        unique: true
    },
    status:{
        type:String,
        required: true,
        enum: {
            values: ['Completed','Incomplete'],
            message: 'status can be either Completed or Incompleted'
        }
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Task = mongoose.model('Task',taskSchema);

module.exports = Task;

