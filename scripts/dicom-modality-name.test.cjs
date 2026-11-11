const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sandbox = { exports: {}, require: () => ({}) };
vm.runInNewContext(ts.transpileModule(
  fs.readFileSync(path.join(__dirname, '../src/services/apiDicom.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText, sandbox);
const { modalityName } = sandbox.exports;

test('Orthanc modalities display the top-level facility for plain device names', () => {
  assert.equal(modalityName({ equipment: { name: 'Ultrasound' }, facility: { name: 'Hospital' } }), 'Ultrasound — Hospital');
});
test('generated equipment names do not repeat the facility', () => {
  assert.equal(modalityName({ equipment: { name: 'CT Scanner — Hospital' }, facility: { name: 'Hospital' } }), 'CT Scanner — Hospital');
});
test('the explicit facility replaces an outdated generated suffix', () => {
  assert.equal(modalityName({ equipment: { name: 'Ultrasound — Old Hospital' }, facility: { name: 'New Hospital' } }), 'Ultrasound — New Hospital');
});
test('legacy and raw Orthanc entries retain their names when facility is absent', () => {
  assert.equal(modalityName({ equipment: { name: 'CT — Hospital' }, facility: null }), 'CT — Hospital');
  assert.equal(modalityName({ name: 'ORTHANC_A' }), 'ORTHANC_A');
  assert.equal(modalityName({}), '-');
});
