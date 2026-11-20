import { ApplicationException } from "../../pkg/errors/error.exception.js";

const globalErrorHandler =(err,req,res,next)=>{
  if (err instanceof ApplicationException) {
    console.log(err);

    return res.status(err.statusCode).json({
      status: "fail",
      error: err.name,
      message: err.message,
      cause: err.cause,
    });
  }

  // errors thrown by express.json(): body too large (413), invalid JSON (400) ...
  // they carry their own 4xx status, they're the client's fault, not a server error
  if (err.type && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ status: "fail", message: err.message });
  }

  res.status(500).json({ status: "error", message: "Something went wrong",cause: err.cause,
  });
  console.log(err);
  

}
export default globalErrorHandler