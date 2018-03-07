var test = require('tape');
var KoaResponse = require('../lib/response');

var ctx = {};

function newResponse() {
  return new KoaResponse(ctx);
}

test('Getters', function(t) {
  var response = newResponse();

  t.equal(response.status, 404);
  t.equal(response.message, "Not Found");
  t.equal(response.body, null);

  t.assert(response.header instanceof Headers);
  t.assert(response.headers instanceof Headers);

  t.assert(response.writable);
  t.assert(!response.headerSent);
  t.equal(response.length, 0);

  t.end();
});

test('Status change', function(t) {
  var response = newResponse();

  response.status = 200;
  t.equal(response.status, 200);
  t.equal(response.message, "OK");

  response.message = "Not OK";
  t.equal(response.message, "Not OK");

  response.status = 500;
  t.equal(response.status, 500);

  t.equal(response.message, "Not OK");

  t.end();
});

test('Headers', function(t) {
  var response = newResponse();

  response.set('X-Hello', 'world');
  t.equal(response.get('X-Hello'), 'world');

  response.set('X-Hello', ['foo', 'bar']);
  t.equal(response.get('X-Hello'), 'foo, bar');

  response.set({
    'X-Hello': 'baz',
    'X-World': 'qux'
  });

  t.equal(response.get('X-Hello'), 'baz');
  t.equal(response.get('X-World'), 'qux');

  response.append('X-Hello', 'foo');
  t.equal(response.get('X-Hello'), 'baz, foo');

  response.append('X-Hello', ['foo', 'baz']);
  t.equal(response.get('X-Hello'), 'baz, foo, foo, baz');

  response.remove('X-Hello');
  t.equal(response.get('X-Hello'), null);

  t.end();
});

test('Header helpers', function(t) {
  var response = newResponse();

  response.etag = "Hello world";
  t.equal(response.etag, '"Hello world"');

  t.end();
});