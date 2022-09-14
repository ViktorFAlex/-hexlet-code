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

const getState = (obj1, obj2, value1, value2, key) => {
  switch (true) {
    case ((_.has(obj1, key) && _.has(obj2, key)) && (_.isObject(value1) && _.isObject(value2))):
      return 'bothChildrenObjects';
    case (value1 === value2):
    case (_.has(obj1, key) && _.isEmpty(obj2, key)):
      return 'parentsObjectAndUndefOrChildrenEqual';
    case ((_.has(obj2, key) && _.isEmpty(obj1, key))):
      return 'parentsUndefAndObject';
    case (_.has(obj1, key) && _.has(obj2, key)):
      return 'keyInBothParents';
    case (_.has(obj1, key)):
      return 'keyInFirstParent';
    case (_.has(obj2, key)):
      return 'keyInSecondParent';
    default:
      throw new Error('Unexpectated state!');
  }
};

const getNewType = (state) => {
  switch (state) {
    case ('bothChildrenObjects'):
    case ('parentsObjectAndUndefOrChildrenEqual'):
    case ('parentsUndefAndObject'):
      return 'unchanged';
    case ('keyInBothParents'):
      return 'changed';
    case ('keyInFirstParent'):
      return 'deleted';
    case ('keyInSecondParent'):
      return 'added';
    default:
      throw new Error(`Unexpectated state : ${state}!`);
  }
};

const buildTree = (obj1, obj2) => {
  const sortedKeys = _.sortBy(mergeKeys(obj1, obj2));
  return sortedKeys.flatMap((key) => {
    const [val1, val2] = getChildrenValues(key, obj1, obj2);
    const children1 = _.isObject(val1) ? buildTree(val1, {}) : val1;
    const children2 = _.isObject(val2) ? buildTree({}, val2) : val2;
    const state = getState(obj1, obj2, val1, val2, key);
    const newType = getNewType(state);
    const newNode = { name: key, type: newType };
    switch (state) {
      case ('bothChildrenObjects'):
        return { ...newNode, children: buildTree(val1, val2) };
      case ('parentsObjectAndUndefOrChildrenEqual'):
      case ('keyInFirstParent'):
        return { ...newNode, children: children1 };
      case ('parentsUndefAndObject'):
      case ('keyInSecondParent'):
        return { ...newNode, children: children2 };
      case ('keyInBothParents'):
        return { ...newNode, children: { old: children1, new: children2 } };
      default:
        throw new Error(`Unexpectated state : ${state}!`);
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
