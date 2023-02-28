module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        error:err,
        stack:err.stack,
        status: err.status,
        message: err.message
    })
}