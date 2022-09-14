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
    const children1 = _.isObject(val1) ? buildTree(val1, {}) : val1;
    const children2 = _.isObject(val2) ? buildTree({}, val2) : val2;
    switch (true) {
      case (_.isObject(val1) && _.isObject(val2)):
        return { name: key, type: 'nested', children: buildTree(val1, val2) };
      case (_.isEmpty(obj1) || _.isEmpty(obj2)):
        return { name: key, type: 'nested', children: children1 || children2 };
      case (val1 === val2):
        return { name: key, type: 'unchanged', children: children1 };
      case (_.has(obj1, key) && _.has(obj2, key)):
        return { name: key, type: 'changed', children: { old: children1, new: children2 } };
      case (_.has(obj1, key)):
        return { name: key, type: 'deleted', children: children1 };
      case (_.has(obj2, key)):
        return { name: key, type: 'added', children: children2 };
      default:
        throw new Error('Unexpectated result!');
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
