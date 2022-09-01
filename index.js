import fs from 'fs';
import path from 'path';
import _ from 'lodash';

const readFile = (pathToFile) => {
  const absolutePath = path.resolve(process.cwd(), '__fixtures__', pathToFile);
  const fileData = fs.readFileSync(absolutePath).toString();
  return fileData;
};

const mergeKeys = (data1, data2) => {
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);
  return _.union(keys1, keys2);
};

export default (path1, path2) => {
  const data1 = readFile(path1);
  const data2 = readFile(path2);
  const dataObject1 = JSON.parse(data1);
  const dataObject2 = JSON.parse(data2);
  const mergedKeys = mergeKeys(dataObject1, dataObject2);
  const sorted2 = _.sortBy(mergedKeys).reduce((acc, val) => {
    const value1 = _.get(dataObject1, val, '');
    const value2 = _.get(dataObject2, val, '');
    const defaultIndent = '  ';
    if (value1 === value2) {
      return _.concat(...[acc], [`${defaultIndent}  ${val}: ${value1}`]);
    }
    if (value2 === '') {
      return _.concat(...[acc], [`${defaultIndent}- ${val}: ${value1}`]);
    }
    if (value1 === '') {
      return _.concat(...[acc], [`${defaultIndent}+ ${val}: ${value2}`]);
    }
    return _.concat(
      ...[acc],
      [`${defaultIndent}- ${val}: ${value1}`],
      [`  + ${val}: ${value2}`],
    );
  }, []);
  console.log(['{', ...sorted2, '}'].join('\n'));
};
