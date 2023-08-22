const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    due_date: {
        type: String,
      required: true,
    },
    task_status: {
      type: String,
      enum: ["To_do", "In_progress", "completed_by_assigner" ,"completed"],
      default: "To_do",
    },
    task_assign_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    task_provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    is_task_Completed :{
      type: Boolean
    }

  },
  { timestamps: true }
);
module.exports = mongoose.model("Task", TaskSchema);
