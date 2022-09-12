import YAML from 'yaml';

const parsingConfig = {
  '.json': JSON.parse,
  '.yaml': YAML.parse,
  '.yml': YAML.parse,
};

export default (fileData, fileExt) => {
  try {
    return parsingConfig[fileExt](fileData);
  } catch (e) {
    throw new Error('Invalid parsing result!');
  }
};
