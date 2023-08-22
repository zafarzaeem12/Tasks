const User = require("../model/Users");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const Register_New_User = async (req, res) => {
  const typed_Email = req.body.email;
  
  try {
    const emailValidation = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    const check_email = await User.findOne({ email: typed_Email });
    const pass = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;

    if (check_email?.email == typed_Email) {
      res.send({
        message: "this email is already exists",
        status: 400,
      });
    } 
    else if (!typed_Email) {
      res.send({
        message: "Email is required",
        status: 404,
      })
    }
    else if (!typed_Email.match(emailValidation)) {
      res.send({
        message: "Email is not valid",
        status: 404,
      })
    }
    else if (!req.body.password) {
      res.send({
        message: "Password is required",
        status: 404,
      })
    }
    else if (!req.body.password.match(pass)) {
      res.send({
        message: "Password should be 8 characters long (should contain uppercase, lowercase, numeric and special character)",
        status: 404,
      })
    }
    else {
     
      const newUser = {
        email: typed_Email,
        password: CryptoJS.AES.encrypt(
          req.body.password,
          process.env.SECRET_KEY
        ).toString(),
      };
      const Register = await User.create(newUser)

      const { _id, ...others } = Register;

    const num = Math.floor(Math.random() * 900000) + 100000;
    const nums = await User.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          verification_code: num,
        },
      },
      { new: true }
    );
    const { password, email, verification_code, ...othersfields } = nums;
    return res.status(201).send({
      message: "OTP sent for New user confirmation",
      status: 201,
      data: { verification_code, email },
    });
    }
  } catch (err) {
    res.send({
      message: err.message,
      status: 404,
    });
  }
};

const LoginRegisteredUser = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    

    const LoginUser = await User.findOne({
      email: email,
    });
    const gen_password = CryptoJS.AES.decrypt(
      LoginUser?.password,
      process.env.SECRET_KEY
    );
    const original_password = gen_password.toString(CryptoJS.enc.Utf8);

    if (email !== LoginUser?.email) {
      res.send({ message: "Email Not Matched" });
    } else if (password !== original_password) {
      res.send({ message: "Password Not Matched" });
    } else {
      const token = jwt.sign(
        {
          id: LoginUser._id,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1h" }
      );
      const save_token = await User.findByIdAndUpdate(
        { _id: LoginUser?._id?.toString() },
        { $set: { user_authentication: `${token}` } },
        { new: true }
      );
      const { user_authentication } = save_token;

      res.send({
        message: "Login Successful",
        status: 200,
        data: { user_authentication },
      });
    }
  } catch (err) {
    res.send({
      message: "Login Failed",
      status: 404,
    });
  }
};

const CompleteProfile = async (req,res,next) => {
  const email = req.body.email
  try{
    if(!email){
      return res.send({ message : "Email Field is required" , status :400})
    }
    else if(!req.body.phone_number){
      return res.send({ message : "Phone no Field is required" , status :400})
    }
    else if (req.body.phone_number.length > 11) {
      res.send({
        message: "No phone_number more than exceed with 11 digits",
        status: 400,
      });
      
    }
    else{
      console.log(req.file.path.replace(/\\/g, "/"))
      const findemail = await User.findOne({ email : email})
      const Data = {
        user_image : req.file ? req.file.path.replace(/\\/g, "/") : req.body.user_image,
        phone_number : req.body.phone_number,
        email : findemail.email,
        user_is_profile_complete :true
      }
       await User.updateOne(
        { _id : findemail._id },
        { $set : Data},
        {new : true}
      )
      res.status(200).send({ message : "Profile Complete Successfully"})
    }
  }catch(err){
    res.status(404).send({ message : "Profile Not Completed"})
  }
}

const VerifyRegisteredUser = async (req, res) => {
  try {
    const Id = req.id;

    const verified_User = await User.findById(Id);
    const { password, ...details } = verified_User._doc;
    res.send({
      message: `${details?.name} Logged in Successfully`,
      status: 200,
      data: { ...details },
    });
  } catch (err) {
    res.send({
      message: "Login Failed!",
      status: 404,
    });
  }
};

const Update_Existing_User = async (req, res, next) => {
  const Id = req.id;
  console.log(Id)
  try {
    const Update_user = await User.findByIdAndUpdate(
      { _id: Id },
      {
        $set: {
          name: req.body.name,
          phone_number: req.body.phone_number,
          user_image: req.file ? req.file.path.replace(/\\/g, "/") : req.body.user_image,
          user_is_profile_complete: true,
        },
      },
      { new: true }
    );
    const { password, ...others } = Update_user._doc;

    res.send({
      message: `User Updated Successfully`,
      data: 204,
      data: others,
    });
  } catch (err) {
    res.send({
      message: `No User Updated`,
      status: 404,
    });
  }
};

const Delete_Existing_User_Permanently = async (req, res, next) => {
  const Id = req.id;
  try {
    const deleteUser = await User.deleteOne({ _id: Id });
    const { acknowledged, deletedCount } = deleteUser;

    if (acknowledged === true && deletedCount === 1) {
      res.send({
        message: "User Delete Successfully",
        status: 200,
      });
    } else {
      res.send({
        message: "User Not Delete",
        status: 200,
      });
    }
  } catch (err) {
    res.send({
      message: "User Not Found",
      status: 200,
    });
  }
};

const User_Forget_Password = async (req, res, next) => {
  try {
    const email = req.body.email;
    const userfind = await User.findOne({ email: email });
    if (userfind.email == null) {
      res.send({
        message: "Not OTP generated",
        code: 404,
      });
      next();
    } else if (userfind?.email) {
      const num = Math.floor(Math.random() * 900000) + 100000;
      const nums = await User.findOneAndUpdate(
        userfind?.email && userfind?._id,
        {
          $set: {
            verification_code: num,
            user_is_forgot: true,
          },
        },
        { new: true }
      );
      const { verification_code, email, ...others } = nums;
      res.send({
        message: "OTP generated",
        code: 201,
        data: { verification_code, email },
      });
    }
  } catch (err) {
    res.send({
      message: "Not Found OTP",
      code: 404,
    });
  }
};

const OTP_Verification = async (req, res, next) => {
  try {
    const typed_OTP = req.body.verification_code;
    const typed_email = req.body.email;
    const data = await User.findOne({ email: typed_email });
    if (typed_email == data?.email && typed_OTP == data?.verification_code) {
      const checked = await User.updateOne(
        { _id: data?._id },
        { is_verified: true },
        { new: true }
      );
      const { acknowledged, modifiedCount } = checked;
      acknowledged === true && modifiedCount === 1
        ? res.send({
            message: "OTP verified",
            status: 200,
            data: { email: data?.email },
          })
        : null;
    } else {
      res.send({
        message: "OTP Not verified",
        status: 404,
      });
    }
  } catch (err) {
    res.send({
      message: "Data not found",
      status: 404,
    });
  }
};

const User_Reset_Password = async (req, res, next) => {
  const typed_email = req.body.email;
  const typed_password = req.body.password;

  const data = await User.findOne({ email: typed_email });
  if (typed_email == data?.email) {
    const gen_password = CryptoJS.AES.decrypt(
      data?.password,
      process.env.SECRET_KEY
    );
    const original_password = gen_password.toString(CryptoJS.enc.Utf8);

    if (typed_password != original_password) {
      const users = await User.findOneAndUpdate(
        data?.email && data?._id,
        {
          $set: {
            user_is_forgot : false,
            password: CryptoJS.AES.encrypt(
              typed_password,
              process.env.SECRET_KEY
            ).toString(),
          },
        },
        { new: true }
      );

      const { password, ...others } = users;

      res.send({
        message: "Password Changed Successfully",
        status: 201,
        data: others._doc,
      });
    } else {
      res.send({
        message: "Password Not Changed",
        status: 404,
      });
    }
  }
};

const Delete_and_Blocked_Existing_User_Temporaray = async (req, res, next) => {
  try {
    const email = req.query.email;
    const is_Blocked = req.query.is_Blocked;
    const is_profile_deleted = req.query.is_profile_deleted;
    const Users = await User.findOne({ email: email });

    if (is_Blocked) {
      const reported_User = await User.findByIdAndUpdate(
        { _id: Users._id },
        { $set: { is_Blocked: is_Blocked } },
        { new: true }
      );
      res.send({
        message:
          reported_User?.is_Blocked === true
            ? `this user ${reported_User?.name} is Blocked successfully`
            : `this user ${reported_User?.name} is Un_Blocked successfully`,
        status: 201,
      });
    } else if (is_profile_deleted) {
      const reported_User = await User.findByIdAndUpdate(
        { _id: Users._id },
        { $set: { is_profile_deleted: is_profile_deleted } },
        { new: true }
      );
      res.send({
        message:
          reported_User?.is_profile_deleted === true
            ? `this user ${reported_User?.name} is Deleted successfully`
            : `this user ${reported_User?.name} is Restore successfully`,
        status: 201,
      });
    }
  } catch (err) {
    res.send({
      message: "Status Not Chnaged",
      status: 404,
    });
  }
};

const Logout_Existing_User = async (req,res,next) => {
  const ID = req.id
  try{
    const Empty_token = await User.findOne({ _id : ID });
    const reported_User = await User.findByIdAndUpdate(
      { _id: Empty_token._id },
      { $set: { user_authentication: "" } },
      { new: true }
    );

    res.send({
      message : `${reported_User?.name} Logout Successfully`,
      status : 204,

    })

  }catch(err){
    res.send({
      message: "Status Not Chnaged",
      status: 404,
    });
  }
}

module.exports = {
  Register_New_User,
  LoginRegisteredUser,
  CompleteProfile,
  VerifyRegisteredUser,
  Update_Existing_User,
  Delete_Existing_User_Permanently,
  Delete_and_Blocked_Existing_User_Temporaray,
  User_Forget_Password,
  OTP_Verification,
  User_Reset_Password,
  Logout_Existing_User
};
