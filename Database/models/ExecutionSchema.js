import mongoose from "mongoose";

const ExecutionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    repoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repo",
      required: true,
    },

    codeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Code",
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    codeSnapshot: {
      type: String,
      required: true,
    },

    status: {
      type: String,

      enum: [
        "queued",
        "running",
        "completed",
        "failed",
      ],

      default: "queued",
    },

    output: {
      type: String,
      default: "",
    },

    error: {
      type: String,
      default: "",
    },

    executionTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Execution", ExecutionSchema);
