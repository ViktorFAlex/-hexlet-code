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
      return '1';
    case (value2 === undefined):
      return '2';
    case (value1 === value2):
      return '3';
    case (_.isObject(value1) && _.isObject(value2)):
      return '4';
    default:
      return '5';
  }
};

const addNewTypes = (state, isChangedType) => {
  const typeForDeleted = isChangedType ? 'deleted' : 'unchanged';
  const typeForAdded = isChangedType ? 'added' : 'unchanged';
  switch (state) {
    case '1':
      return [typeForAdded, null];
    case '2':
      return [typeForDeleted, null];
    case '3':
    case '4':
      return ['unchanged', null];
    case '5':
      return ['changed', 'set'];
    default:
      throw new Error(`Unexpectated state: ${state}!`);
  }
};

const getChildrenValues = (node, data1, data2) => [_.get(data1, node), _.get(data2, node)];

const merge = (data1, data2, isChangedType = true) => {
  const sortedKeys = _.sortBy(mergeKeys(data1, data2));
  return sortedKeys.flatMap((elem) => {
    const [val1, val2] = getChildrenValues(elem, data1, data2);
    const state = getState(val1, val2);
    const [type1, type2] = addNewTypes(state, isChangedType);
    const children1 = _.isObject(val1) ? merge(val1, {}, false) : val1;
    const children2 = _.isObject(val2) ? merge({}, val2, false) : val2;
    const obj1 = { name: elem, type: type1 };
    const obj2 = { name: elem, type: type2 };
    switch (state) {
      case '1':
        return { ...obj1, children: children2 };
      case '2':
      case '3':
        return { ...obj1, children: children1 };
      case '4':
        return { ...obj1, children: merge(val1, val2) };
      case '5':
        return [{ ...obj1, children: children1 }, { ...obj2, children: children2 }];
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
