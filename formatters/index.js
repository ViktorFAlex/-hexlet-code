import plain from './plain.js';
import stylish from './stylish.js';

export default (file, format = 'stylish') => (format === 'stylish' ? stylish(file) : plain(file));
