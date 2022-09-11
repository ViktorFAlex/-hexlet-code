import fs from 'fs';
import path from 'path';

export default (pathToFile) => {
  const absolutePath = path.resolve(process.cwd(), pathToFile);
  const fileData = fs.readFileSync(absolutePath).toString();
  const fileExt = path.extname(pathToFile);
  return [fileData, fileExt];
};
