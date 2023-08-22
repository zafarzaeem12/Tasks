const Task = require("../model/Task");
const moment = require("moment");
const createTask = async (req, res, next) => {
  try {
    if (!req.body.title) {
      return res.status(404).send({ message: "Title is required" });
    } else if (!req.body.description) {
      return res.status(404).send({ message: "Description is required" });
    } else if (!req.body.due_date) {
      return res.status(404).send({ message: "Due_Date is required" });
    } else {
      const Data = {
        title: req.body.title,
        description: req.body.description,
        due_date: moment(req.body.due_date).format("YYYY-MM-DDThh:mm:ss A"),
        task_status: req.body.task_status,
      };
      const taskstart = await Task.create(Data);
      res
        .status(200)
        .send({ message: "Task Assigned Successfully", data: taskstart });
    }
  } catch (err) {
    res.status(500).send({ message: "no task found" });
  }
};
const Assigned_Task = async (req,res,next) => {
try{
    const Data = {
        task_id : req.params.id,
        task_assign_to : req.body.task_assign_to,
        task_provider :   req.body.task_provider,
        task_status :  "In_progress"
    }
    await Task.updateOne(
        { _id : req.params.id} , 
        { $set : Data } ,
     { new : true })

    res.status(200).send({ message : "Task Assigned now" })

}catch(err){
    res.status(404).send({ message : "Task not Assigned" })
}
}
const Task_Completed_By_Assigner  = async (req,res,next) => {
    try{
        const Data = {
            task_id : req.params.id,
            task_assign_to :   req.body.task_assign_to,
            task_status :  "completed_by_assigner",
        }
      
        await Task.updateOne({ _id : req.params.id} , { $set : Data } , { new : true })

        res.status(200).send({ message : "Task Completed By Assigner" })
    }catch(err){
        req.status(500).send({ message : "not completed"})
    }
}
const Task_Completed_By_Provider = async (req,res,next) => {
    try{
        const Data = {
            task_id : req.params.id,
            task_provider :   req.body.task_provider,
            task_status :  "completed",
            is_task_Completed : true
        } 
        await Task.updateOne({ _id : req.params.id} , { $set : Data } , { new : true }) 

        res.status(200).send({ message : "Task Completed By Provider" })
    }catch(err){
        req.status(500).send({ message : "not completed"})
    }
}
const getallTask = async (req, res, next) => {
  try {
    const alldata = await Task.find()
      .populate({
        path: "task_assign_to",
        select: "name email user_image phone_number",
      })
      .populate({
        path: "task_provider",
        select: "name email user_image phone_number",
      });
    res.status(200).send({
      total: alldata.length,
      message: "Data Fetched Successfully",
      data: alldata,
    });
  } catch (err) {
    res.status(500).send({ message: "Data Not Fetched" });
  }
};
const get_specfic_task = async (req, res, next) => {
    const id = req.params.id;
  try {
    const alldata = await Task.findById(id)
    .populate({
      path: "task_assign_to",
      select: "name email user_image phone_number",
    })
    .populate({
      path: "task_provider",
      select: "name email user_image phone_number",
    });
  res.status(200).send({
    total: alldata.length,
    message: "Data Fetched Successfully",
    data: alldata,
  });
  } catch (err) {
    res.status(500).send({ message: "Data not found" });
  }
};
const update_task = async (req, res, next) => {
  try {
    const updatedYask = await Task.findByIdAndUpdate(
        {_id : req.params.id},
        { $set : {
            title : req.body.title,
            description : req.body.description,
            due_date : req.body.due_date,

        } },
        { new : true}
    )
        res.status(200).send({ message : "Task Updated Successfully" , data : updatedYask })
  } catch (err) {
    res.status(500).send({ message: "Task Not Updated" });
  }
};
const delete_task = async (req, res, next) => {

  try {
    const deleted = await Task.deleteOne({ _id : req.params.id });
    res.status(200).send({ message : "Task Deleted Successfully"})
  } catch (err) {
    res.status(500).send({ message: "task not deleted" });
  }
};

module.exports = {
  createTask,
  getallTask,
  get_specfic_task,
  update_task,
  delete_task,
  Assigned_Task,
  Task_Completed_By_Assigner,
  Task_Completed_By_Provider
};
