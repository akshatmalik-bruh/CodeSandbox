import { Worker } from "bullmq";
import { connection } from "./connection.js";
import { updateExecutionResult } from "../SandBoxes/sandbox.services.js";

const runWorker = new Worker(
  "runQueue",

  async (job) => {

    try {

      const { executionId, codeSnapshot, language } = job.data;

      await updateExecutionResult(
        executionId,
        "",
        "",
        "running",
        0
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );

      await updateExecutionResult(
        executionId,
        "Execution output here",
        "",
        "completed",
        1000
      );

    } catch (err) {

      await updateExecutionResult(
        job.data.executionId,
        "",
        err.message,
        "failed",
        0
      );

    }

  },

  {
    connection,
  }
);