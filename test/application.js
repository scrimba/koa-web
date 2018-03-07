var test = require('tape');
var Koa = require('../lib');

async function call(app, url) {
  var handler = app.handler();
  var req = new Request(url);
  var res = await handler(req);
  return res;
}

test("Basic app", async function(t) {
  var app = new Koa;

  app.use((ctx, next) => {
    ctx.status = 200;
    ctx.body = "Hello " + ctx.path;
    ctx.type = "text/html";
  });

  var res = await call(app, "http://127.0.0.1/world");
  t.equal(res.status, 200);

  var body = await res.text();
  t.equal(body, "Hello /world");
  t.end();
});

test("app.ctx", async function(t) {
  var app = new Koa;
  app.ctx.hello = 1;

  app.use((ctx, next) => {
    ctx.body = "hello=" + ctx.hello;
  });

  var res = await call(app, "http://127.0.0.1/world");
  var body = await res.text();
  t.equal(body, "hello=1");
  t.end();
});
