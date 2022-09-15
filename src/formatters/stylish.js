const generateSymbol = (type) => {
  switch (type) {
    case 'unchanged':
    case 'nested':
    case 'incomparable':
      return '  ';
    case 'deleted':
      return '- ';
    case 'added':
      return '+ ';
    default:
      throw new Error(`Unexpected node difference: ${type}!`);
  }
};

export default (obj) => {
  const iter = (node, depth = 0) => {
    const defaultSpaceCount = depth * 4;
    const bracketIndent = ' '.repeat(defaultSpaceCount);
    const baseIndent = ' '.repeat(defaultSpaceCount + 2);
    const result = node.flatMap((elem) => {
      const { key, type, children } = elem;
      if (type === 'changed') {
        const firstSymbol = generateSymbol('deleted');
        const secondSymbol = generateSymbol('added');
        const indent1 = `${baseIndent}${firstSymbol}`;
        const indent2 = `${baseIndent}${secondSymbol}`;
        const { old: oldVal, new: newVal } = children;
        const oldChildren = Array.isArray(oldVal) ? iter(oldVal, depth + 1) : oldVal;
        const newChildren = Array.isArray(newVal) ? iter(newVal, depth + 1) : newVal;
        return [`${indent1}${key}: ${oldChildren}`, `${indent2}${key}: ${newChildren}`];
      }
      const newChildren = Array.isArray(children) ? iter(children, depth + 1) : children;
      const additionalSymbol = generateSymbol(type);
      const indent = `${baseIndent}${additionalSymbol}`;
      return [`${indent}${key}: ${newChildren}`];
    });
    return ['{', ...result, `${bracketIndent}}`].join('\n');
  };
  return iter(obj);
};
