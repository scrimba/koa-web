var test = require('tape');
var KoaRequest = require('../lib/request');

var complexUrl = "https://www.vg.no:81/foo/bar%2f.html?hello=1#world";
var ctx = {};

function newRequest() {
  var req = new Request(complexUrl);
  return new KoaRequest(ctx, req);
}

test('Getters', function(t) {
  var request = newRequest();

  t.assert(request.URL instanceof URL, '#URL');
  t.is(request.method, 'GET', '#method');
  t.assert(request.idempotent, '#idempotent');
  t.equal(request.protocol, 'https', '#protocol');
  t.equal(request.secure, true, '#secure');
  t.equal(request.origin, 'https://www.vg.no:81', '#origin');
  t.equal(request.host, 'www.vg.no:81', '#host');
  t.equal(request.hostname, 'www.vg.no', '#hostname');
  t.equal(request.url, '/foo/bar%2f.html?hello=1#world', '#url');
  t.equal(request.path, '/foo/bar%2f.html', '#path');
  t.equal(request.href, complexUrl, '#href');
  t.equal(request.querystring, 'hello=1', '#querystring');
  t.equal(request.search, '?hello=1', '#search');

  t.end();
});


test('#method', function(t) {
  var request = newRequest();

  request.method = 'POST';
  t.equal(request.method, 'POST', 'Setting method');
  t.assert(!request.idempotent, '#idempotent is updated');

  t.end();
});

test('Query string', function(t) {
  var request = newRequest();

  t.equal(request.query.hello, "1");
  t.assert('hello' in request.query);

  // Updating
  request.querystring = "hello=2";
  t.equal(request.query.hello, "2");

  // Iterating
  var items = [];
  for (var key in request.query) {
    items.push(key);
  }
  t.deepEqual(["hello"], items);

  request.query = {world: 3};
  t.equal(request.querystring, "world=3");

  t.end();
})

test('#url', function(t) {
  var request = newRequest();

  ["/hello", "/hello?world", "/hello#world", "/hello?wat#world"].forEach(val => {
    request.url = val;
    t.equal(request.url, val);
  });

  t.end();
});

test('headers', function(t) {
  var req = new Request(complexUrl, {
    headers: {
      'pragma': 'no-cache',
      'content-type': 'text/html;charset=utf-8'
    }
  });
  var request = new KoaRequest(ctx, req);

  t.equal(request.get('Pragma'), 'no-cache');
  t.equal(request.header, request.headers);
  t.assert(request.headers instanceof Headers);

  t.equal(request.type, 'text/html');
  t.equal(request.charset, 'utf-8');
  t.equal(request.length, 0);

  request.headers = {
    'Accept': 'text/plain'
  };

  t.equal(request.get('Accept'), 'text/plain');

  t.end();
});