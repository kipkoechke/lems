const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/services/apiEquipment.ts'), 'utf8');
const sandbox = { exports: {}, require: () => ({}) };
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, sandbox);
const { equipmentOwnerName } = sandbox.exports;

test('plain equipment names display the structured facility name', () => {
  assert.equal(equipmentOwnerName('Ultrasound', { name: 'Kisii Teaching and Referral Hospital' }), 'Kisii Teaching and Referral Hospital');
});
test('structured facility takes precedence over a legacy name suffix', () => {
  assert.equal(equipmentOwnerName('Ultrasound — Old Hospital', { name: 'New Hospital' }), 'New Hospital');
});
test('legacy names still work when facility is absent or blank', () => {
  for (const facility of [undefined, null, { name: '  ' }]) {
    assert.equal(equipmentOwnerName('Ultrasound — Hospital', facility), 'Hospital');
  }
});
test('missing facility data does not invent a facility', () => {
  assert.equal(equipmentOwnerName('Ultrasound'), '');
  assert.equal(equipmentOwnerName(null), '');
});
