import { Worker } from "bullmq";

import { connection } from "./connection.js";

import { updateExecutionResult } from "../SandBoxes/sandbox.services.js";

import { welcomeTemplate } from "../mail/template.js";

import { sendMail } from "../mail/sendmail.js";

import { createCodeFile } from "../codefilecreation/readandwrite.js";

import { executeCode } from "../codefilecreation/execute.js";

const extensionMap = {
  javascript: "js",
  python: "py",
  java: "java",
  "c++": "cpp",
};

const runWorker = new Worker(

  "runQueue",

  async (job) => {

    try {

      console.log("Job received");

      const {
        executionId,
        codeSnapshot,
        language,
      } = job.data;

      console.log("Updating status to running");

      await updateExecutionResult(
        executionId,
        "",
        "",
        "running",
        0
      );

      const extension =
        extensionMap[language];

      if (!extension) {
        throw new Error(
          "Unsupported language"
        );
      }

      console.log("Creating code file");

      const file = await createCodeFile(
        executionId,
        extension,
        codeSnapshot
      );

      console.log("File created:", file);

      const start = Date.now();

      console.log("Executing code");

      const output = await executeCode(
        file.filePath,
        file.folderPath,
        language
      );

      console.log("Execution completed");

      const executionTime =
        Date.now() - start;

      await updateExecutionResult(
        executionId,
        output,
        "",
        "completed",
        executionTime
      );

      console.log("DB updated");

    } catch (err) {

      console.error(
        "Execution Worker Error:",
        err
      );

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

    try {

      const { email, name } = job.data;

      const subject =
        "Welcome to CodeSandbox!";

      const html =
        welcomeTemplate(name);

      await sendMail({
        to: email,
        subject,
        html,
      });

      console.log(
        "Email sent successfully"
      );

    } catch (err) {

      console.error(
        "Error sending email:",
        err
      );

      throw err;
    }

  },

  {
    connection,
  }
);