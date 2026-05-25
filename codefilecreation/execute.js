import { exec } from "child_process";
import path from "path";

export const executeCode = (
  filePath,
  folderPath,
  language
) => {

  return new Promise((resolve, reject) => {

    const absolutePath =
      path.resolve(folderPath);

    let command = "";

    if (language === "python") {

      command =
        `docker run --rm -v "${absolutePath}:/code" python:3.9-slim python /code/main.py`;

    }

    else if (language === "javascript") {

      command =
        `docker run --rm -v "${absolutePath}:/code" node:20 node /code/main.js`;

    }

    else {

      return reject(
        new Error("Unsupported language")
      );

    }

    console.log("Executing Command:");
    console.log(command);

    exec(

      command,

      {
        timeout: 10000,
      },

      (error, stdout, stderr) => {

        const cleanedStdout =
          stdout?.trim();

        const cleanedStderr =
          stderr?.trim();

        console.log("STDOUT:");
        console.log(cleanedStdout);

        console.log("STDERR:");
        console.log(cleanedStderr);

        if (error) {

          // Always reject with an Error object so that err.message is
          // accessible in the Workers.js catch block. Previously this
          // rejected with a raw string which caused err.message to be
          // undefined, silently swallowing syntax errors and compile errors.
          const message =
            cleanedStderr ||
            (error.killed
              ? `Execution timed out after ${error.signal || "SIGTERM"}`
              : error.message);

          return reject(new Error(message));

        }

        // Include stderr in the resolved value so warnings are visible.
        const output =
          [cleanedStdout, cleanedStderr]
            .filter(Boolean)
            .join("\n") ||
          "Execution completed with no output.";

        resolve(output);

      }

    );

  });

};