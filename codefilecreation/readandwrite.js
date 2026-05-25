import fs from "fs/promises";
import path from "path";

export const createFolder = async (executionId) => {

  const folderPath = path.join(
    "temp",
    executionId.toString()
  );

  await fs.mkdir(folderPath, {
    recursive: true,
  });

  return folderPath;
};

export const createCodeFile = async (
  executionId,
  extension,
  content
) => {

  const folderPath = await createFolder(
    executionId
  );

  const filePath = path.join(
    folderPath,
    `main.${extension}`
  );

  await fs.writeFile(
    filePath,
    content,
    "utf-8"
  );

  return {
    folderPath,
    filePath,
  };
};