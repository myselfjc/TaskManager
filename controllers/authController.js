const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('./../utils/email');

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

exports.signUp = async (req,res) =>{
    const {firstName, lastName, email, password, confirmPassword} = req.body;
    try{
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            confirmPassword
        })
        const jwtToken = createToken(user._id);
        res.status(200).json({
            status: 'Success',
            token: jwtToken,
            data: {
                user
            }
        })
    }
    catch(err){
        res.status(404).json({
            status: 'Failed',
            data:{
                err
            }
            
        })
    }
}

exports.login = async(req,res) => {
    const {email,password} = req.body;
    try{
        if(!email || !password){
            res.status(404).json({
                status: 'Failed',
                message: 'Please enter your email and password'
            })
        }

        const user = await User.findOne({email}).select('+password');
        
        if(!user || !(await user.checkPassword(password, user.password))){
            res.status(401).json({
                status: 'Failed',
                message: 'User or password is incorrect!'
            })
        }
        
        const jwtToken = createToken(user._id);
        const otp = await user.createOtp(jwtToken);


        const message = `Here is your 6 digit otp for login : ${otp}`;
        await sendEmail({
            email: user.email,
            subject: 'OTP Verification',
            message
        });

        res.status(200).json({
            status:'Success',
            message:'User successfully logged in',
            token:jwtToken,
            otp:otp,
            data:{
                user
            }
        })

    }catch(err){
        res.status(404).json({
            status: 'Failed',
            message: err
        })
    }
}

exports.protect = async (req,res,next)=> {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(" ")[1];
    }
    console.log(token);
    if(!token){
        return res.status(401).json({
            status: 'Failed',
            message: 'User is not authorized!!'
        })
    }

    next();
}