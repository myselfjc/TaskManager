const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('./../utils/email');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');


// Jwt Token Creation- Used in Login
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}


// User Signup
exports.signUp = catchAsync(async (req, res, next) => {
    // Destructuring the body into variables
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        confirmPassword
    })

    // Creating the OTP and storing it into User's data for verification purpose
    const otp = Math.floor(100000 + Math.random() * 90000);
    user.otp = otp;
    await user.save({validateBeforeSave : false});

    // Email Contents to send verification mail
    const text = `Here is your 6 digit otp for login : ${otp}`;
    const subject = `OTP for verification`;
    const html = `<p>Your OTP verification code is ${otp}</p>`
    
    await sendEmail(email, subject, text, html); // sendEmail function is coming from utils/email.js

    // sending the success response
    res.status(200).json({
        status: 'Success',
        message: 'Signup successfull! Kindly go ahead and verify your OTP'
    })
}
)


// User Verification
exports.verifyOtp = catchAsync(async (req, res, next) => {
    // Destructuring the body into variables
    const { email, otp } = req.body;

    if (!email || !otp) return next(new AppError('Please enter your email and OTP!', 404)); 

    // Getting the User from the database
    const user = await User.findOne({ email });

    if(!user) return next(new AppError('User doesnt exist!', 404));

    //Matching the OTP entered by the user with the OTP saved in User's data
    if (Number(otp) !== user.otp) {
        return next(new AppError('Wrong OTP entered!', 404));
    }

    // Once OTP is verified, will delete the OTP field from data
    user.verified = true;
    user.otp = undefined;

    // Saving the updated User data
    await user.save({validateBeforeSave : false});

    // sending the success response
    res.status(200).json({
        status: 'Success',
        message: 'OTP verified successfully!'
    })
})

exports.login = catchAsync(async (req, res, next) => {
    // Destructuring the body into variables
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Please enter your email and password!', 404));

    // Getting the User from the database along with its password
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('User or password is incorrect!', 404));
    }

    // Setting the User's password to undefined so that it doesn't show up in response, NOTE : We are not saving the password = undefined
    user.password = undefined;

    if (user.verified !== true) return next(new AppError('User is not verified! Please verify your email to login successfully!', 404));

    // Creating and Sending the JWT Token via cookie
    const jwtToken = createToken(user._id);
    const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly : true
    }
    res.cookie("jwt",jwtToken,cookieOptions);
    

    // sending the success response 
    res.status(200).json({
        status: 'Success',
        message: 'User successfully logged in',
        token:jwtToken,
        data:{
            user
        }
    })
}
)


// Protect API to check if User is already logged in or if User's jwt token is not expired
exports.protect = catchAsync(async (req, res, next) => {
    let token;

    // Fetching the token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next(new AppError('User is not authorized! Please Log in to continue', 404));

    // verifying the token and storing the token details details into decoded
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Getting the User from the data by using its id
    const user = await User.findById(decoded.id);

    // saving the User details into req.user
    req.user = user;

    next();
})