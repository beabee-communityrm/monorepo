import * as fs from "fs";
import * as path from "path";

export const createTestFile = (filePath: string, mimeType: string): File => {
  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  return new File([buffer], fileName, { type: mimeType });
};
