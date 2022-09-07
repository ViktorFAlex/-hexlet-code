const addIndent = (type) => {
  switch (type) {
    case ('unchanged'):
      return '    ';
    case ('added'):
    case ('set'):
      return '  + ';
    case ('deleted'):
    case ('changed'):
      return '  - ';
    default:
      throw new Error('Unexpected file difference');
  }
};

export default (file) => {
  const iter = (node, depth = 0) => {
    const baseIndent = ' '.repeat(depth * 4);
    const result = node.reduce((acc, elem) => {
      const { name, type, children } = elem;
      const newChildren = Array.isArray(children) ? iter(children, depth + 1) : children;
      const indent = `${baseIndent}${addIndent(type)}`;
      return [...acc, `${indent}${name}: ${newChildren}`];
    }, []);
    return ['{', ...result, `${baseIndent}}`].join('\n');
  };
  return iter(file);
};
