const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Load the real service and Axios interceptors without a browser or API server.
function setup(loginBody, profileBody, profileStatus = 200) {
  const cache = new Map();
  const storage = new Map([['authToken', 'old-token']]);
  function load(file) {
    const filename = path.resolve(__dirname, '..', file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports, process,
      window: { location: { pathname: '/login' } },
      localStorage: { getItem: key => storage.get(key) ?? null },
      require(id) {
        if (id.startsWith('@/')) return load(`src/${id.slice(2)}.ts`);
        if (id.startsWith('.')) return load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${id}.ts`)));
        return require(id);
      },
    });
    return module.exports;
  }
  const auth = load('src/services/apiAuth.ts');
  const client = load('src/lib/axios.ts').default;
  const requests = [];
  client.defaults.adapter = async config => {
    requests.push(config);
    if (config.url === '/auth/me' && profileStatus !== 200) {
      throw { response: { status: profileStatus, data: { message: 'Forbidden' } } };
    }
    return { data: config.url === '/auth/login' ? loginBody : profileBody, status: 200, statusText: 'OK', headers: {}, config };
  };
  return { auth, requests, storage };
}

const user = { id: 'user-1', name: 'Test User', email: 'test@example.test', phone: '', role: { key: 'payer', type: 'system', label: 'Payer' } };
const credentials = { email: 'test@example.test', password: 'test-only' };

test('token-only login retrieves identity using the NEW token, without persisting partial auth', async () => {
  const { auth, requests, storage } = setup({ token: 'new-token' }, user);
  const result = await auth.loginFetcher(credentials);
  assert.equal(result.user.id, user.id);
  assert.equal(result.user.role, 'payer');
  assert.equal(result.token, 'new-token');
  assert.equal(requests[1].headers.Authorization, 'Bearer new-token');
  assert.equal(storage.get('authToken'), 'old-token');
});

test('standard login preserves entity and skips profile lookup', async () => {
  const { auth, requests } = setup({ token: 'new-token', user: { ...user, entity: { type: 'facility', id: 'f1', name: 'Facility', fr_code: '123' } } });
  const result = await auth.loginFetcher(credentials);
  assert.equal(result.facility.id, 'f1');
  assert.equal(result.facility.code, '123');
  assert.equal(requests.length, 1);
});

test('wrapped login and profile responses are supported', async () => {
  const { auth } = setup({ data: { token: 'new-token' } }, { data: { user } });
  assert.equal((await auth.loginFetcher(credentials)).user.role, 'payer');
});

test('missing token, malformed profile, and forbidden profile fail clearly', async () => {
  for (const [login, profile, status] of [[{}, user, 200], [{ token: 'new-token' }, {}, 200], [{ token: 'new-token' }, user, 403]]) {
    const { auth } = setup(login, profile, status);
    await assert.rejects(auth.loginFetcher(credentials), /Sign-in response|user profile/);
  }
});
