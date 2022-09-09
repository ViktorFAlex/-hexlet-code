import _ from 'lodash';
import parse from './parsers.js';
import format from './formatters/index.js';

const mergeKeys = (data1, data2) => {
  const keys1 = data1 ? Object.keys(data1) : [];
  const keys2 = data2 ? Object.keys(data2) : [];
  return _.union(keys1, keys2);
};

const getState = (value1, value2) => {
  switch (true) {
    case (value1 === undefined):
      return 'undefined1';
    case (value2 === undefined):
      return 'undefined2';
    case (value1 === value2):
      return 'equal';
    case (_.isObject(value1) && _.isObject(value2)):
      return 'bothObjects';
    default:
      return 'diffState';
  }
};

const getChildrenValues = (node, data1, data2) => [_.get(data1, node), _.get(data2, node)];

const merge = (data1, data2, isChangedType = true) => {
  const sortedKeys = _.sortBy(mergeKeys(data1, data2));
  return sortedKeys.flatMap((elem) => {
    const [val1, val2] = getChildrenValues(elem, data1, data2);
    const state = getState(val1, val2);
    const typeForDeleted = isChangedType ? 'deleted' : 'unchanged';
    const typeForAdded = isChangedType ? 'added' : 'unchanged';
    const children1 = _.isObject(val1) ? merge(val1, {}, false) : val1;
    const children2 = _.isObject(val2) ? merge({}, val2, false) : val2;
    const obj1 = { name: elem, type: 'unchanged', children: children1 };
    const obj2 = { name: elem, type: 'unchanged', children: children2 };
    switch (state) {
      case 'undefined1':
        return { ...obj2, type: typeForAdded };
      case 'undefined2':
        return { ...obj1, type: typeForDeleted };
      case 'equal':
        return obj1;
      case 'bothObjects':
        return { ...obj1, children: merge(val1, val2) };
      case 'diffState':
        return [{ ...obj1, type: 'changed' }, { ...obj2, type: 'set' }];
      default:
        throw new Error(`Unexpectated state: ${state}!`);
    }
  });
};

export default (path1, path2, formatName) => {
  const dataObject1 = parse(path1);
  const dataObject2 = parse(path2);
  const result = merge(dataObject1, dataObject2, true);
  return format(result, formatName);
};
