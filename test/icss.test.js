import path from 'path';
import fs from 'fs';

import {
  compile,
  execute,
  getCompiler,
  getErrors,
  getModuleSource,
  getWarnings,
  readAsset,
} from './helpers/index';

const testCasesPath = path.join(__dirname, 'fixtures/icss/tests-cases');
const testCases = fs.readdirSync(testCasesPath);

describe('ICSS', () => {
  testCases.forEach((name) => {
    it(`case ${name}`, async () => {
      const compiler = getCompiler(`./icss/tests-cases/${name}/source.js`);
      const stats = await compile(compiler);

      expect(
        getModuleSource(`./icss/tests-cases/${name}/source.css`, stats)
      ).toMatchSnapshot('module');
      expect(
        execute(readAsset('main.bundle.js', compiler, stats))
      ).toMatchSnapshot('result');
      expect(getWarnings(stats)).toMatchSnapshot('warnings');
      expect(getErrors(stats)).toMatchSnapshot('errors');
    });
  });
});
