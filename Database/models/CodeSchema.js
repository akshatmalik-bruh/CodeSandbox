import mongoose from "mongoose";

const CodeSchema = new mongoose.Schema(
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

    filename: {
      type: String,
      required: true,
      trim: true,
    },

    language: {
      type: String,
      required: true,
      lowercase: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Code", CodeSchema);