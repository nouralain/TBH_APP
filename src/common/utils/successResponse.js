const successResponse =(res,{message="Done",success=true,status=200,data=undefined})=>{
return res.status(status).json({message,success,data})
}
export default successResponse