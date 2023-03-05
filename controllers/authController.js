const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('./../utils/email');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

exports.signUp = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        confirmPassword
    })

    const otp = Math.floor(100000 + Math.random() * 90000);
    user.otp = otp;
    await user.save({validateBeforeSave : false});


    const text = `Here is your 6 digit otp for login : ${otp}`;
    const subject = `OTP for verification`;
    const html = `<p>Your OTP verification code is ${otp}</p>`
    
    await sendEmail(email, subject, text, html);

    res.status(200).json({
        status: 'Success',
        message: 'Signup successfull! Kindly go ahead and verify your OTP'
    })
}
)

exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) return next(new AppError('Please enter your email and OTP!', 404));

    const user = await User.findOne({ email });

    if(!user) return next(new AppError('User doesnt exist!', 404));

    if (Number(otp) !== user.otp) {
        return next(new AppError('Wrong OTP entered!', 404));
    }

    user.verified = true;
    user.otp = undefined;

    await user.save({validateBeforeSave : false});

    res.status(200).json({
        status: 'Success',
        message: 'OTP verified successfully!'
    })
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Please enter your email and password!', 404));

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('User or password is incorrect!', 404));
    }
    user.password = undefined;

    if (user.verified !== true) return next(new AppError('User is not verified! Please verify your email to login successfully!', 404));

    const jwtToken = createToken(user._id);
    const cookieOptions = {
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly : true
    }
    res.cookie("jwt",jwtToken,cookieOptions);
    
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

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return next(new AppError('User is not authorized! Please Log in to continue', 404));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    req.user = user;

    next();
})