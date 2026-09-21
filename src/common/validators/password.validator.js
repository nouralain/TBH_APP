 const checkPasswordLength = (password) => {
  if (!password) throw new Error("Password is a required field",{cause:{status:400}});
  if (password.length < 6) throw new Error("Password must be more than 6 characters",{cause:{status:400}});

};
export default checkPasswordLength