const makeString = (elem) => (typeof elem === 'string' ? `'${elem}'` : `${elem}`);

export default (file) => {
  const iter = (node, propName, point = false) => {
    const result = node.reduce((acc, elem, index) => {
      const { name, type, children } = elem;
      const newValue = Array.isArray(children) ? '[complex value]' : makeString(children);
      const additionalPoint = point ? '.' : '';
      const newProp = `${propName}${additionalPoint}${name}`;
      if (type === 'unchanged') {
        return Array.isArray(children) ? [...acc, iter(children, `${newProp}`, true)] : [...acc, []];
      }
      if (type === 'added') return [...acc, `Property '${newProp}' was added with value: ${newValue}`];
      if (type === 'deleted') return [...acc, `Property '${newProp}' was removed`];
      if (type === 'set') {
        const value = Array.isArray(node[index - 1].children) ? '[complex value]' : makeString(node[index - 1].children);
        return [...acc, `Property '${newProp}' was updated. From ${value} to ${newValue}`];
      }
      return [...acc, []];
    }, []);
    return result.flat(Infinity).join('\n').trim();
  };
  return iter(file, '');
};
