const isAppropriate = (elem) => (typeof elem === 'string' || Array.isArray(elem));
const makeStr = (elem) => (Array.isArray(elem) ? '[complex value]' : `'${elem}'`);

export default (obj) => {
  const iter = (node, propName, point = false) => {
    const result = node.map((elem, index) => {
      const { name, type, children } = elem;
      const prevElem = node[index - 1];
      const prevChildren = prevElem ? prevElem.children : [];
      const newVal = isAppropriate(children) ? makeStr(children) : children;
      const prevVal = isAppropriate(prevChildren) ? makeStr(prevChildren) : prevChildren;
      const additionalPoint = point ? '.' : '';
      const newProp = `${propName}${additionalPoint}${name}`;
      switch (type) {
        case 'unchanged':
          return Array.isArray(children) ? iter(children, newProp, true) : [];
        case 'added':
          return `Property '${newProp}' was added with value: ${newVal}`;
        case 'deleted':
          return `Property '${newProp}' was removed`;
        case 'set':
          return `Property '${newProp}' was updated. From ${prevVal} to ${newVal}`;
        case 'changed':
          return [];
        default:
          throw new Error(`Unexpected type: ${type}!`);
      }
    });
    return result.flat(Infinity).join('\n').trim();
  };
  return iter(obj, '');
};
