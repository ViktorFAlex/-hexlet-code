import _ from 'lodash';
import parse from './parsers.js';
import format from '../formatters/index.js';

const mergeKeys = (data1, data2) => {
  const keys1 = data1 ? Object.keys(data1) : [];
  const keys2 = data2 ? Object.keys(data2) : [];
  return _.union(keys1, keys2);
};

export default (path1, path2, formatName) => {
  const dataObject1 = parse(path1);
  const dataObject2 = parse(path2);
  const iter = (data1, data2, changeKey = true) => {
    const sortedKeys = _.sortBy(mergeKeys(data1, data2));
    // don't change type if comparing nested elems;
    const typeForDeleted = changeKey ? 'deleted' : 'unchanged';
    const typeForAdded = changeKey ? 'added' : 'unchanged';
    return sortedKeys.reduce((acc, elem) => {
      const children1 = _.get(data1, elem);
      const children2 = _.get(data2, elem);
      if (!_.isObject(children1) && !_.isObject(children2)) {
        if (children1 === children2) {
          return [...acc, { name: elem, type: 'unchanged', children: children1 }];
        }
        if (children1 !== undefined && children2 !== undefined) {
          return [...acc, { name: elem, type: 'changed', children: children1 },
            { name: elem, type: 'set', children: children2 }];
        }
        return children1 === undefined ? [...acc, { name: elem, type: `${typeForAdded}`, children: children2 }]
          : [...acc, { name: elem, type: `${typeForDeleted}`, children: children1 }];
      }
      if (_.isObject(children1) && _.isObject(children2)) {
        return [...acc, { name: elem, type: 'unchanged', children: iter(children1, children2) }];
      }
      if (_.isObject(children1) && children2 !== undefined) {
        return [...acc, { name: elem, type: 'changed', children: iter(children1, {}, false) },
          { name: elem, type: 'set', children: children2 }];
      }
      if (_.isObject(children2) && children1 !== undefined) {
        return [...acc, { name: elem, type: 'changed', children: children1 },
          { name: elem, type: 'set', children: iter({}, children2) }];
      }
      return children1 ? [...acc, { name: elem, type: `${typeForDeleted}`, children: iter(children1, {}, false) }]
        : [...acc, { name: elem, type: `${typeForAdded}`, children: iter({}, children2, false) }];
    }, []);
  };
  const result = iter(dataObject1, dataObject2, true);
  return format(result, formatName);
};

// DELETE AFTER REVIEW:
// export default (path1, path2, formatter = stylish) => {
//   const dataObject1 = parse(path1);
//   const dataObject2 = parse(path2);
//   const iter = (data1, data2, changed) => {
//     const sortedKeys = _.sortBy(mergeKeys(data1, data2));
//     const children = sortedKeys.reduce((acc, elem) => {
//       const keeped = `  ${elem}`;
//       const deleted = !changed ? `- ${elem}` : keeped;
//       const added = !changed ? `+ ${elem}` : keeped;
//       const children1 = _.get(data1, elem, '');
//       const children2 = _.get(data2, elem, '');
//       if (!_.isObject(children1) && !_.isObject(children2)) {
//         if (children1 === children2) {
//           return { ...acc, [keeped]: children1 };
//         }
//         if (children1 !== '' && children2 !== '') {
//           return { ...acc, [deleted]: children1, [added]: children2 };
//         }
//         return children1 === '' ? { ...acc, [added]: children2 } : { ...acc, [deleted]
// : children1 };
//       }
//       if (_.isObject(children1) && _.isObject(children2)) {
//         return { ...acc, [keeped]: iter(children1, children2) };
//       }
//       if (_.isObject(children1) && children2 !== '') {
//         return { ...acc, [deleted]: iter(children1, {}, true), [added]: children2 };
//       }
//       if (_.isObject(children2) && children1 !== '') {
//         return { ...acc, [deleted]: children1, [added]: iter({}, children2, true) };
//       }
//       return children1 ? { ...acc, [deleted]: iter(children1, {}, true) }
//         : { ...acc, [added]: iter({}, children2, true) };
//     }, {});
//     return { ...children };
//   };
//   const result = iter(dataObject1, dataObject2, false);
//   return formatter(result);
// };
