'use strict';

const contentType = require('content-type');

class KoaRequest {
  constructor(ctx, req) {
    this.ctx = ctx;
    this._url = new URL(req.url);
    this._method = req.method;
    this._headers = req.headers;
    this._querycache = {};
  }

  get URL() {
    return this._url;
  }

  get header() {
    return this.headers;
  }

  set header(val) {
    this.headers = val;
  }

  get headers() {
    return this._headers;
  }

  set headers(val) {
    this._headers = new Headers(val);
  }

  get url() {
    return this._url.pathname + this._url.search + this._url.hash;
  }

  set url(val) {
    const parts = val.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    this._url.pathname = parts[1];
    this._url.search = parts[2] || "";
    this._url.hash = parts[3] || "";
  }

  get href() {
    return this._url.toString();
  }

  get method() {
    return this._method;
  }

  set method(val) {
    this._method = val;
  }

  get query() {
    const qs = this.querystring;
    var obj = this._querycache[qs];
    if (obj) return obj;

    obj = this._querycache[qs] = {};

    for (const pair of this._url.searchParams) {
      obj[pair[0]] = pair[1];
    }
    return Object.freeze(obj);
  }

  set query(obj) {
    const parts = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const escKey = window.encodeURIComponent(key);
        const escValue = window.encodeURIComponent(obj[key]);
        parts.push(`${escKey}=${escValue}`);
      }
    }
    this.querystring = parts.join('&');
  }

  get querystring() {
    return this.search.slice(1);
  }

  set querystring(str) {
    this.search = str;
  }

  get fresh() {
    const method = this.method;
    const s = this.ctx.status;

    // GET or HEAD for weak freshness validation only
    if ('GET' != method && 'HEAD' != method) return false;

    // 2xx or 304 as per rfc2616 14.26
    if ((s >= 200 && s < 300) || 304 == s) {
      return fresh(this.header, this.ctx.response.header);
    }

    return false;
  }

  get stale() {
    return !this.fresh;
  }

  get idempotent() {
    const methods = ['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE'];
    return !!~methods.indexOf(this.method);
  }

  get charset() {
    let type = this.get('Content-Type');
    if (!type) return '';

    try {
      type = contentType.parse(type);
    } catch (e) {
      return '';
    }

    return type.parameters.charset || '';
  }

  get length() {
    const len = this.get('Content-Length');
    if (len == '') return;
    return ~~len;
  }

  get protocol() {
    return this.protocolWithColon.slice(0, -1);
  }

  get secure() {
    return 'https' == this.protocol;
  }

  get ips() {
    return [];
  }

  get subdomains() {
    return [];
  }

  get type() {
    const type = this.get('Content-Type');
    if (!type) return '';
    return type.split(';')[0];
  }

  get(field) {
    const headers = this._headers;
    switch (field = field.toLowerCase()) {
      case 'referrer':
        return headers.get('referer');
      default:
        return headers.get(field);
    }
  }
}

function delegateToUrl(name, target) {
  if (!target) target = name;

  Object.defineProperty(KoaRequest.prototype, name, {
    get: function() {
      return this._url[target];
    },
    set: function(val) {
      this._url[target] = val;
    }
  })
}

delegateToUrl("origin")
delegateToUrl("path", "pathname")
delegateToUrl("search")
delegateToUrl("host")
delegateToUrl("hostname")
delegateToUrl("protocolWithColon", "protocol")

module.exports = KoaRequest;