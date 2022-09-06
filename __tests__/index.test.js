import { test, expect } from '@jest/globals';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import genDiff from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8');

test('gendiff with stylish json', () => {
  const file1 = getFixturePath('file1.json');
  const file2 = getFixturePath('file2.json');
  const result = readFile('resultStylish.txt');
  expect(genDiff(file1, file2, 'stylish')).toEqual(result);
});

test('gendiff with stylish yaml', () => {
  const file1 = getFixturePath('file1.yaml');
  const file2 = getFixturePath('file2.yaml');
  const result = readFile('resultStylish.txt');
  expect(genDiff(file1, file2, 'stylish')).toEqual(result);
});

test('gendiff with plain json', () => {
  const file1 = getFixturePath('file1.json');
  const file2 = getFixturePath('file2.json');
  const result = readFile('resultPlain.txt');
  expect(genDiff(file1, file2, 'plain')).toEqual(result);
});

test('gendiff with plain yaml', () => {
  const file1 = getFixturePath('file1.yaml');
  const file2 = getFixturePath('file2.yaml');
  const result = readFile('resultPlain.txt');
  expect(genDiff(file1, file2, 'plain')).toEqual(result);
});

test('gendiff with json', () => {
  const file1 = getFixturePath('file1.json');
  const file2 = getFixturePath('file2.json');
  const result = readFile('resultJson.txt');
  expect(genDiff(file1, file2, 'json')).toEqual(result);
});

test('gendiff with json', () => {
  const file1 = getFixturePath('file1.yaml');
  const file2 = getFixturePath('file2.yaml');
  const result = readFile('resultJson.txt');
  expect(genDiff(file1, file2, 'json')).toEqual(result);
});
