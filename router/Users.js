const router = require('express').Router();
const auth = require('../middleware/Authentication');
const File = require('../middleware/ImagesandVideosData');
const { 
    Register_New_User ,
    LoginRegisteredUser ,
    VerifyRegisteredUser,
    Update_Existing_User,
    Delete_Existing_User_Permanently,
    User_Forget_Password,
    OTP_Verification,
    User_Reset_Password,
    Delete_and_Blocked_Existing_User_Temporaray,
    Logout_Existing_User
} = require('../controller/Users')


const {
    createTask,
    getallTask,
    get_specfic_task,
    update_task,
    delete_task,
    Assigned_Task,
    Task_Completed_By_Assigner,
    Task_Completed_By_Provider,
    All_Completed_Task
} = require('../controller/Task')

// user api start here
router.post('/create_new_User'  , File.user , Register_New_User);
router.post('/login' ,  LoginRegisteredUser);
router.get('/profile' ,auth ,File.upload ,VerifyRegisteredUser );
router.put('/update',auth ,File.user , Update_Existing_User );
router.delete('/delete',auth , File.upload  , Delete_Existing_User_Permanently );
router.put('/softdelete' , Delete_and_Blocked_Existing_User_Temporaray )
router.post('/forget_password' ,  User_Forget_Password );
router.post('/otp_verify' ,  OTP_Verification);
router.post('/reset_password' , User_Reset_Password)
router.post('/logout' , auth , Logout_Existing_User );
// user api end here

// task api start here
router.post('/createtask' , auth , createTask );
router.put('/task_assigned/:id' , auth , Assigned_Task);
router.put('/task_onboarding/:id' , auth , Task_Completed_By_Assigner )
router.put('/taskcompleted/:id' , auth , Task_Completed_By_Provider )
router.get('/get' , auth , getallTask );
router.get('/get/:id' , auth , get_specfic_task );
router.put('/update/:id' , auth , update_task );
router.delete('/delete/:id' , auth , delete_task );
router.get('/completed' ,auth ,All_Completed_Task )
// task api start here

module.exports = router