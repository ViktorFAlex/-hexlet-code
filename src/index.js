import _ from 'lodash';
import parse from './parsers.js';
import format from './formatters/index.js';
import readFile from './readfile.js';

const mergeKeys = (data1, data2) => {
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);
  return _.union(keys1, keys2);
};

const getChildrenValues = (node, data1, data2) => [_.get(data1, node), _.get(data2, node)];

const merge = (data1, data2, isChangedType = true) => {
  const sortedKeys = _.sortBy(mergeKeys(data1, data2));
  return sortedKeys.flatMap((elem) => {
    const [val1, val2] = getChildrenValues(elem, data1, data2);
    const typeForDeleted = isChangedType ? 'deleted' : 'unchanged';
    const typeForAdded = isChangedType ? 'added' : 'unchanged';
    const children1 = _.isObject(val1) ? merge(val1, {}, false) : val1;
    const children2 = _.isObject(val2) ? merge({}, val2, false) : val2;
    const obj1 = { name: elem, type: 'unchanged', children: children1 };
    const obj2 = { name: elem, type: 'unchanged', children: children2 };
    switch (true) {
      case (!_.has(data1, elem)):
        return { ...obj2, type: typeForAdded };
      case (!_.has(data2, elem)):
        return { ...obj1, type: typeForDeleted };
      case (val1 === val2):
        return obj1;
      case (_.isObject(val1) && _.isObject(val2)):
        return { ...obj1, children: merge(val1, val2) };
      default:
        return [{ ...obj1, type: 'changed' }, { ...obj2, type: 'set' }];
    }
  });
};

export default (path1, path2, formatName = 'stylish') => {
  const [fileData1, fileExt1] = readFile(path1);
  const [fileData2, fileExt2] = readFile(path2);
  const dataObject1 = parse(fileData1, fileExt1);
  const dataObject2 = parse(fileData2, fileExt2);
  const result = merge(dataObject1, dataObject2, true);
  return format(result, formatName);
};
