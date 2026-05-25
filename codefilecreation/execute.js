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

    else if (language === "java") {

      command =
        `docker run --rm -v "${absolutePath}:/code" openjdk:11 bash -c "javac /code/Main.java && java -cp /code Main"`;

    }

    else if (language === "c++") {

      command =
        `docker run --rm -v "${absolutePath}:/code" gcc:11 bash -c "g++ /code/main.cpp -o /code/a.out && /code/a.out"`;

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
        timeout: 5000,
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

          return reject(

            cleanedStderr ||
            error.message

          );

        }

        resolve(

          cleanedStdout ||
          cleanedStderr ||
          "Execution completed"

        );

      }

    );

  });

};