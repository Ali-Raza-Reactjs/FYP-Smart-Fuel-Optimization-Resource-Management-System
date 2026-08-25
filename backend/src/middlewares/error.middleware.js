const { ApiResponseModel } = require("../utils/classes");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const apiResponseModel = new ApiResponseModel();
  
  apiResponseModel.status = false;
  apiResponseModel.msg = err.message;
  apiResponseModel.errors = {
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  };
  
  res.status(statusCode).json(apiResponseModel);
};

module.exports = errorHandler;
