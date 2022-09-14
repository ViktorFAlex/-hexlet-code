const generateSymbol = (type) => {
  switch (type) {
    case 'unchanged':
      return '  ';
    case 'deleted':
      return '- ';
    case 'changed':
      return ['- ', '+ '];
    case 'added':
      return '+ ';
    default:
      throw new Error(`Unexpected node difference: ${type}!`);
  }
};

export default (obj) => {
  const iter = (node, depth = 0) => {
    const bracketIndent = ' '.repeat(depth * 4);
    const baseIndent = ' '.repeat(depth * 4 + 2);
    const result = node.flatMap((key) => {
      const { name, type, children } = key;
      if (type === 'changed') {
        const [firstSyms1, firstSyms2] = generateSymbol(type);
        const indent1 = `${baseIndent}${firstSyms1}`;
        const indent2 = `${baseIndent}${firstSyms2}`;
        const children1 = children.old;
        const children2 = children.new;
        const newChildren1 = Array.isArray(children1) ? iter(children1, depth + 1) : children1;
        const newChildren2 = Array.isArray(children2) ? iter(children2, depth + 1) : children2;
        return [`${indent1}${name}: ${newChildren1}`, `${indent2}${name}: ${newChildren2}`];
      }
      const newChildren = Array.isArray(children) ? iter(children, depth + 1) : children;
      const firstSyms = generateSymbol(type);
      const indent = `${baseIndent}${firstSyms}`;
      return [`${indent}${name}: ${newChildren}`];
    });
    return ['{', ...result, `${bracketIndent}}`].join('\n');
  };
  return iter(obj);
};
