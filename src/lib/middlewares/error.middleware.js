import { ApplicationException } from "../../pkg/error.exception.js";

const globalErrorHandler =(err,req,res,next)=>{
  if (err instanceof ApplicationException) {
    return res.status(err.statusCode).json({
      status: "fail",
      error: err.name,
      message: err.message,
      cause: err.cause,
    });
  }

  res.status(500).json({ status: "error", message: "Something went wrong"       ,cause: err.cause,
  });
  console.log(err);
  

}
export default globalErrorHandler