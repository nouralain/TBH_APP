const emailValidation =(email)=>{
        if (!email) throw new Error("email is a required field",{cause:{status:400}});

    const trimmedEmail = email.trim();
  if (!trimmedEmail) throw new Error("Email is a required field",{cause:{status:400}});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) throw new Error("Invalid email format",{cause:{status:400}});

  return trimmedEmail;
}
export default emailValidation