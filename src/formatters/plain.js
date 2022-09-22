import _ from 'lodash';

const makeStr = (value) => {
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
      const property = `${propName}${separator}${key}`;
      if (type === 'changed') {
        const { old: oldVal, new: newVal } = children;
        const deletedValue = makeStr(oldVal);
        const addedValue = makeStr(newVal);
        return `Property '${property}' was updated. From ${deletedValue} to ${addedValue}`;
      }
      if (type === 'deleted') {
        return `Property '${property}' was removed`;
      }
      if (type === 'added') {
        const newChildren = makeStr(children);
        return `Property '${property}' was added with value: ${newChildren}`;
      }
      return Array.isArray(children) ? iter(children, property, true) : [];
    });
    return result.join('\n');
  };
  return iter(obj, '');
};
