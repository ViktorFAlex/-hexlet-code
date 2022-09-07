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
    case (!_.isObject(value1) && !_.isObject(value2)):
      switch (true) {
        case (value1 === value2):
          return 1;
        case (value1 !== undefined && value2 !== undefined):
          return 2;
        case (value1 === undefined):
          return 3;
        default:
          return 4;
      }
    case (_.isObject(value1) && _.isObject(value2)):
      return 5;
    case (_.isObject(value1) && value2 !== undefined):
      return 6;
    case (_.isObject(value2) && value1 !== undefined):
      return 7;
    case (value1 === undefined):
      return 8;
    case (value2 === undefined):
      return 9;
    default:
      throw new Error('Unexpectated state of values');
  }
};

const addNewTypes = (state, elem, isChangeKey) => {
  const typeForDeleted = isChangeKey ? 'deleted' : 'unchanged';
  const typeForAdded = isChangeKey ? 'added' : 'unchanged';
  const obj = { name: elem };
  switch (state) {
    case (1):
    case (5):
      return [{ ...obj, type: 'unchanged' }, {}];
    case (2):
    case (6):
    case (7):
      return [{ ...obj, type: 'changed' }, { ...obj, type: 'set' }];
    case (3):
    case (8):
      return [{ ...obj, type: `${typeForAdded}` }, {}];
    default:
      return [{ ...obj, type: `${typeForDeleted}` }, {}];
  }
};

const getChildrenValues = (node, data1, data2) => [_.get(data1, node), _.get(data2, node)];

const iter = (data1, data2, isChangeType = true) => {
  const sortedKeys = _.sortBy(mergeKeys(data1, data2));
  return sortedKeys.flatMap((elem) => {
    const [val1, val2] = getChildrenValues(elem, data1, data2);
    const state = getState(val1, val2);
    const [obj1, obj2] = addNewTypes(state, elem, isChangeType);
    switch (state) {
      case (1):
      case (4):
        return [{ ...obj1, children: val1 }];
      case (2):
        return [{ ...obj1, children: val1 }, { ...obj2, children: val2 }];
      case (3):
        return [{ ...obj1, children: val2 }];
      case (5):
        return [{ ...obj1, children: iter(val1, val2) }];
      case (6):
        return [{ ...obj1, children: iter(val1, {}, false) }, { ...obj2, children: val2 }];
      case (7):
        return [{ ...obj1, children: val1 }, { ...obj2, children: iter({}, val2, false) }];
      case (8):
        return [{ ...obj1, children: iter(val2, {}, false) }];
      case (9):
        return [{ ...obj1, children: iter({}, val1, false) }];
      default:
        throw new Error('Unexpectated state');
    }
  });
};

export default (path1, path2, formatName) => {
  const dataObject1 = parse(path1);
  const dataObject2 = parse(path2);
  const result = iter(dataObject1, dataObject2, true);
  return format(result, formatName);
};
