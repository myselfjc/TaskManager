const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({path:'./config.env'});

mongoose.connect(process.env.DB_LOCAL).then(()=>console.log('DB Connected successfully!')).catch((err)=>console.log(`There is some Error in connecting to DB`));



const port = process.env.PORT;

app.listen(port,(req,res)=>{
    console.log(`Server is running on ${port}`);
})