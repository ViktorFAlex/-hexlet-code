import _ from 'lodash';

const symbols = {
  doubleSpace: '  ',
  minusWithSpace: '- ',
  plusWithSpace: '+ ',
};

const generateIndents = (depth) => {
  const indentForLinesCount = 2;
  const indentCount = 4;
  const linesIndent = ' '.repeat(depth * indentCount + indentForLinesCount);
  const bracketIndent = ' '.repeat(depth * indentCount);
  return [linesIndent, bracketIndent];
};

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
      const firstSymbol = symbols.minusWithSpace;
      const secondSymbol = symbols.plusWithSpace;
      const firstNode = `${linesIndent}${firstSymbol}${key}: ${format(oldVal, depth + 1)}`;
      const secondNode = `${linesIndent}${secondSymbol}${key}: ${format(newVal, depth + 1)}`;
      return [firstNode, secondNode];
    }
    if (type === 'unchanged' || type === 'nested') {
      return `${linesIndent}${symbols.doubleSpace}${key}: ${format(children, depth + 1)}`;
    }
    const newSymbol = type === 'added' ? symbols.plusWithSpace : symbols.minusWithSpace;
    return `${linesIndent}${newSymbol}${key}: ${format(children, depth + 1)}`;
  });
  return ['{', ...result, `${bracketIndent}}`].join('\n');
};

export default format;
