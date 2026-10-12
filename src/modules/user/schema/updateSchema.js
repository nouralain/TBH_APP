import { loginSchema } from "../../auth/schema/loginSchema.js";
import { signupSchema } from "../../auth/schema/signupSchema.js";

export const updateSchema = loginSchema
  .extend({
    userName: signupSchema.shape.userName,
    phone: signupSchema.shape.phone,
    age: signupSchema.shape.age,
    gender: signupSchema.shape.gender,
  })
  .omit({
    email: true,         
    password: true,       
  })
  .partial()  
  .transform((data) => {
    if (data.userName) {
      const [firstName, lastName] = data.userName.split(" ");
      data.firstName = firstName;
      data.lastName = lastName;
    }
    return data;
  })          
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });