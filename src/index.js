import _ from 'lodash';
import parse from './parsers.js';
import format from './formatters/index.js';
import readFile from './readfile.js';

const mergeKeys = (obj1, obj2) => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  return _.union(keys1, keys2);
};

const getChildrenValues = (node, data1, data2) => [_.get(data1, node), _.get(data2, node)];

const buildTree = (obj1, obj2) => {
  const sortedKeys = _.sortBy(mergeKeys(obj1, obj2));
  return sortedKeys.flatMap((key) => {
    const [val1, val2] = getChildrenValues(key, obj1, obj2);
    switch (true) {
      case (_.isObject(val1) && _.isObject(val2)):
        return { key, type: 'nested', children: buildTree(val1, val2) };
      case (val1 === val2):
        return { key, type: 'unchanged', children: val1 };
      case (_.has(obj1, key) && _.has(obj2, key)): {
        return { key, type: 'changed', children: { old: val1, new: val2 } };
      }
      case (!val1 || !val2): {
        const children = val1 || val2;
        const newType = val1 ? 'deleted' : 'added';
        return { key, type: newType, children };
      }
      default: {
        throw new Error('Unexpected result of comparing!'); // NOTE: doesn't cover by tests!
      }
    }
  });
};

export default (path1, path2, formatName = 'stylish') => {
  const [fileData1, fileExt1] = readFile(path1);
  const [fileData2, fileExt2] = readFile(path2);
  const dataObject1 = parse(fileData1, fileExt1);
  const dataObject2 = parse(fileData2, fileExt2);
  const result = buildTree(dataObject1, dataObject2);
  return format(result, formatName);
};
