import plain from './plain.js';
import stylish from './stylish.js';
import json from './json.js';

export default (file, format) => {
  switch (format) {
    case ('stylish'):
      return stylish(file);
    case ('plain'):
      return plain(file);
    case ('json'):
      return json(file);
    default:
      throw new Error('Unexpected formatter');
  }
};
