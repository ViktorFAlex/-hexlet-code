import { test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import genDiff from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

const files = [['file1.json', 'file2.json'], ['file1.yaml', 'file2.yaml'], ['file1.json', 'file2.yaml']];

test.each(files)('description', (file1, file2) => {
  const file1path = getFixturePath(file1);
  const file2path = getFixturePath(file2);
  const result = readFile('resultStylish.txt');
  expect(genDiff(file1path, file2path, 'stylish')).toEqual(result);
});

test.each(files)('description', (file1, file2) => {
  const file1path = getFixturePath(file1);
  const file2path = getFixturePath(file2);
  const result = readFile('resultPlain.txt');
  expect(genDiff(file1path, file2path, 'plain')).toEqual(result);
});

test.each(files)('description', (file1, file2) => {
  const file1path = getFixturePath(file1);
  const file2path = getFixturePath(file2);
  const result = readFile('resultJson.txt');
  expect(genDiff(file1path, file2path, 'json')).toEqual(result);
});

