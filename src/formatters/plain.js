const isAppropriateType = (elem) => {
  if ((typeof elem === 'string') || (Array.isArray(elem) && elem.length > 0)) {
    return true;
  }
  return false;
};

const makeStr = (elem) => (Array.isArray(elem) ? '[complex value]' : `'${elem}'`);

export default (obj) => {
  const iter = (node, propName, point = false) => {
    const result = node.flatMap((elem) => {
      const { name, type, children } = elem;
      const additionalPoint = point ? '.' : '';
      const newProp = `${propName}${additionalPoint}${name}`;
      if (type === 'changed') {
        const oldVal = children.old;
        const newVal = children.new;
        const deletedValue = isAppropriateType(oldVal) ? makeStr(oldVal) : oldVal;
        const addedValue = isAppropriateType(newVal) ? makeStr(newVal) : newVal;
        return `Property '${newProp}' was updated. From ${deletedValue} to ${addedValue}`;
      }
      if (type === 'deleted') {
        return `Property '${newProp}' was removed`;
      }
      if (type === 'added') {
        const newChildren1 = isAppropriateType(children) ? makeStr(children) : children;
        return `Property '${newProp}' was added with value: ${newChildren1}`;
      }
      return Array.isArray(children) ? iter(children, newProp, true) : [];
    });
    return result.join('\n').trim();
  };
  return iter(obj, '');
};
