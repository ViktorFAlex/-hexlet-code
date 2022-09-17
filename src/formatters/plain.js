import _ from 'lodash';

const isAppropriateType = (elem) => {
  if ((typeof elem === 'string') || _.isObject(elem)) {
    return true;
  }
  return false;
};

const makeStr = (elem) => (_.isObject(elem) ? '[complex value]' : `'${elem}'`);

export default (obj) => {
  const iter = (node, propName, isSeparated = false) => {
    const result = node.flatMap((elem) => {
      const { key, type, children } = elem;
      const separator = isSeparated ? '.' : '';
      const newProp = `${propName}${separator}${key}`;
      if (type === 'changed') {
        const { old: oldVal, new: newVal } = children;
        const deletedValue = isAppropriateType(oldVal) ? makeStr(oldVal) : oldVal;
        const addedValue = isAppropriateType(newVal) ? makeStr(newVal) : newVal;
        return `Property '${newProp}' was updated. From ${deletedValue} to ${addedValue}`;
      }
      if (type === 'deleted') {
        return `Property '${newProp}' was removed`;
      }
      if (type === 'added') {
        const newChildren = isAppropriateType(children) ? makeStr(children) : children;
        return `Property '${newProp}' was added with value: ${newChildren}`;
      }
      return Array.isArray(children) ? iter(children, newProp, true) : [];
    });
    return result.join('\n');
  };
  return iter(obj, '');
};
