#!/usr/bin/env node
import { program } from 'commander';
import genDiff from '../src/index.js';

program
  .name('gendiff')
  .version('1.0.0', '-v, --vers', 'output the current version')
  .description('Compares two configuration files and shows a difference.')
  .helpOption('-h, --help', 'output help message')
  .option('-f, --format [type]', 'output format', 'stylish')
  .argument('<filetype1>')
  .argument('<filetype2>')
  .action((filetype1, filetype2) => {
    const result = genDiff(filetype1, filetype2);
    console.log(result);
  });
program.parse();
