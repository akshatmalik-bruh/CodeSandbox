import { Worker } from "bullmq";
import { connection } from "./connection.js";
import { updateExecutionResult } from "../SandBoxes/sandbox.services.js";
import { welcomeTemplate } from "../mail/template.js";
import { sendMail } from "../mail/sendmail.js";
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

const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    try{
    const { email, name } = job.data;
   
    const subject = "Welcome to CodeSandbox!";
    const html = welcomeTemplate(name);
    await sendMail({ to: email, subject, html });
  }

  catch(err){
    console.error("Error sending email:", err);
  }
},
  {
    connection,
  }

);