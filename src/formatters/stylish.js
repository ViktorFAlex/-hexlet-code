import _ from 'lodash';

const spaceCount = 4;
const linesSpaceCount = 2;

const symbols = {
  space: ' ',
  doubleSpace: '  ',
  minusWithSpace: '- ',
  plusWithSpace: '+ ',
};

const generateIndents = (depth) => {
  const linesIndent = symbols.space.repeat(depth * spaceCount + linesSpaceCount);
  const bracketIndent = symbols.space.repeat(depth * spaceCount);
  return [linesIndent, bracketIndent];
};

export default (obj) => {
  const format = (node, depth = 0) => {
    if (!Array.isArray(node)) {
      return _.isObject(node) ? format(Object.entries(node), depth) : node;
    }
    const [linesIndent, bracketIndent] = generateIndents(depth);
    const result = node.flatMap((elem) => {
      if (Array.isArray(elem)) {
        const [key, value] = elem;
        return `${linesIndent}${symbols.doubleSpace}${key}: ${format(value, depth + 1)}`;
      }
      const { key, type, children } = elem;
      if (type === 'changed') {
        const { old: oldVal, new: newVal } = children;
        const { minusWithSpace: firstSymbol, plusWithSpace: secondSymbol } = symbols;
        const firstNode = `${linesIndent}${firstSymbol}${key}: ${format(oldVal, depth + 1)}`;
        const secondNode = `${linesIndent}${secondSymbol}${key}: ${format(newVal, depth + 1)}`;
        return [firstNode, secondNode];
      }
      if (type === 'unchanged' || type === 'nested') {
        return `${linesIndent}${symbols.doubleSpace}${key}: ${format(children, depth + 1)}`;
      }
      const symbol = type === 'added' ? symbols.plusWithSpace : symbols.minusWithSpace;
      return `${linesIndent}${symbol}${key}: ${format(children, depth + 1)}`;
    });
    return ['{', ...result, `${bracketIndent}}`].join('\n');
  };
  return format(obj);
};
