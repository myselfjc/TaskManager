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
    const otp = await user.createOtp();
    user.otp = otp;
    await user.save({validateBeforeSave : false});


    const message = `Here is your 6 digit otp for login : ${otp}`;
    await sendEmail({
        email: user.email,
        subject: 'OTP Verification',
        message
    });

    res.status(200).json({
        status: 'Success',
        data: {
            user
        }
    })
}
)

exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { email, password, otp } = req.body;
    if (!email || !password || !otp) {
        return next(new AppError('Please enter your email, password and OTP!', 404));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('User or password is incorrect!', 404));
    }
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
    if (!email || !password) {
        return next(new AppError('Please enter your email and password!', 404));
    }

    const user = await User.findOne({ email }).select('+password');


    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new AppError('User or password is incorrect!', 404));
    }
    if (user.verified !== true) return next(new AppError('User is not verified! Please verify your email to login successfully!', 404));

    const jwtToken = createToken(user._id);


    res.status(200).json({
        status: 'Success',
        message: 'User successfully logged in',
        token: jwtToken,
        data: {
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

    if (!token) {
        return next(new AppError('User is not authorized! Please Log in to continue', 404));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    next();
})