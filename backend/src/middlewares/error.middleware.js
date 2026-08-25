const { ApiResponseModel } = require("../utils/classes");

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    if (err.keyValue) {
      const key = Object.keys(err.keyValue)[0];
      const val = err.keyValue[key];
      message = `A record with ${key} '${val}' already exists.`;
    } else {
      message = 'Duplicate field value entered.';
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
    statusCode = 400;
  }

  const apiResponseModel = new ApiResponseModel();
  
  apiResponseModel.status = false;
  apiResponseModel.msg = message;
  apiResponseModel.errors = {
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };
  
  res.status(statusCode).json(apiResponseModel);
};

module.exports = errorHandler;
