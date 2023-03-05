const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({path:'./config.env'});


// Connecting the database
const DB = process.env.DB_CONN.replace('<PASSWORD>',process.env.DB_PASS)
mongoose.connect(DB).then(()=>console.log('DB Connected successfully!')).catch((err)=>console.log(`There is some Error in connecting to DB`));


const port = process.env.PORT;

app.listen(port,(req,res)=>{
    console.log(`Server is running on ${port}`);
})