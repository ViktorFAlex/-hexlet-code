import _ from 'lodash';

const generateNewValue = (value) => {
  if (typeof value === 'string') {
    return `'${value}'`;
  }
  return _.isObject(value) ? '[complex value]' : value;
};

export default (obj) => {
  const iter = (node, propName, isSeparated = false) => {
    const result = node.flatMap((elem) => {
      const { key, type, children } = elem;
      const separator = isSeparated ? '.' : '';
      const newProp = `${propName}${separator}${key}`;
      if (type === 'changed') {
        const { old: oldVal, new: newVal } = children;
        const deletedValue = generateNewValue(oldVal);
        const addedValue = generateNewValue(newVal);
        return `Property '${newProp}' was updated. From ${deletedValue} to ${addedValue}`;
      }
      if (type === 'deleted') {
        return `Property '${newProp}' was removed`;
      }
      if (type === 'added') {
        const newChildren = generateNewValue(children);
        return `Property '${newProp}' was added with value: ${newChildren}`;
      }
      return Array.isArray(children) ? iter(children, newProp, true) : [];
    });
    return result.join('\n');
  };
  return iter(obj, '');
};
