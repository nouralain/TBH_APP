const globalErrorHandler =(error,req,res,next)=>{
return res.status(error.cause?.status??500).json({error_message :error.message ||"Internal Server Error" , error,stack:error.stack})
}
export default globalErrorHandler