import _ from 'lodash';

const generateSymbol = (type) => {
  switch (type) {
    case 'deleted':
      return '  - ';
    case 'added':
      return '  + ';
    default:
      return '    ';
  }
};

export default (obj) => {
  const iter = (node, depth = 0) => {
    if (!Array.isArray(node)) {
      return _.isObject(node) ? iter(Object.entries(node), depth) : node;
    }
    const commonIndent = ' '.repeat(depth * 4);
    const result = node.flatMap((elem) => {
      if (Array.isArray(elem)) {
        const [key, value] = elem;
        return `${commonIndent}${generateSymbol()}${key}: ${iter(value, depth + 1)}`;
      }
      const { key, type, children } = elem;
      if (type === 'changed') {
        const { old: oldVal, new: newVal } = children;
        const firstIndent = `${commonIndent}${generateSymbol('deleted')}`;
        const secondIndent = `${commonIndent}${generateSymbol('added')}`;
        const firstNode = `${firstIndent}${key}: ${iter(oldVal, depth + 1)}`;
        const secondNode = `${secondIndent}${key}: ${iter(newVal, depth + 1)}`;
        return [firstNode, secondNode];
      }
      return `${commonIndent}${generateSymbol(type)}${key}: ${iter(children, depth + 1)}`;
    });
    return ['{', ...result, `${commonIndent}}`].join('\n');
  };
  return iter(obj);
};
