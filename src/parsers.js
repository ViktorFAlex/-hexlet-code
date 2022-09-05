import path from 'path';
import YAML from 'yaml';
import fs from 'fs';

const readFile = (pathToFile) => {
  const absolutePath = path.resolve(process.cwd(), pathToFile);
  const fileData = fs.readFileSync(absolutePath).toString();
  return fileData;
};

export default (file) => {
  const fileType = path.extname(file);
  const data = readFile(file);
  return fileType === '.json' ? JSON.parse(data) : YAML.parse(data);
};
