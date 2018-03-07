'use strict';

const statuses = require('statuses');

class KoaResponse {
  constructor() {
    this._headers = new Headers;
    this._status = 404;
    this._body = null;
  }

  finalize() {
    return new window.Response(this._body, {
      status: this._status,
      headers: this._headers
    })
  }

  get header() {
    return this._headers;
  }

  get headers() {
    return this.header;
  }

  get status() {
    return this._status;
  }

  set status(code) {
    this._status = code;
  }

  get message() {
    return this._statusMessage || statuses[this.status];
  }

  set message(msg) {
    this._statusMessage = msg;
  }

  get body() {
    return this._body;
  }

  set body(val) {
    this._body = val;
  }

  set length(n) {
    // do nothing
  }

  get length() {
    return 0;
  }

  get headerSent() {
    return false;
  }

  redirect(url, alt) {
    // location
    if ('back' == url) url = this.ctx.get('Referrer') || alt || '/';
    this.set('Location', url);

    // status
    if (!statuses.redirect[this.status]) this.status = 302;

    // html
    if (this.ctx.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = `Redirecting to <a href="${url}">${url}</a>.`;
      return;
    }

    // text
    this.type = 'text/plain; charset=utf-8';
    this.body = `Redirecting to ${url}.`;
  }

  attachment(filename) {
    if (filename) this.type = extname(filename);
    this.set('Content-Disposition', contentDisposition(filename));
  }

  set type(type) {
    if (type) {
      this.set('Content-Type', type);
    } else {
      this.remove('Content-Type');
    }
  }

  set lastModified(val) {
    if ('string' == typeof val) val = new Date(val);
    this.set('Last-Modified', val.toUTCString());
  }

  get lastModified() {
    const date = this.get('last-modified');
    if (date) return new Date(date);
  }

  set etag(val) {
    if (!/^(W\/)?"/.test(val)) val = `"${val}"`;
    this.set('ETag', val);
  }

  get etag() {
    return this.get('ETag');
  }

  get type() {
    const type = this.get('Content-Type');
    if (!type) return '';
    return type.split(';')[0];
  }

  get(field) {
    return this.header.get(field);
  }

  set(field, val) {
    if (2 == arguments.length) {
      if (Array.isArray(val)) {
        this._headers.set(field, val[0]);
        for (var i = 1; i < val.length; i++) {
          this._headers.append(field, val[i]);
        }
      } else {
        this._headers.set(field, val);
      }
    } else {
      for (const key in field) {
        this.set(key, field[key]);
      }
    }
  }

  append(field, val) {
    if (Array.isArray(val)) {
      for (var i = 0; i < val.length; i++) {
        this._headers.append(field, val[i]);
      }
    } else {
      this._headers.append(field, val);
    }
  }

  remove(field) {
    this._headers.delete(field);
  }

  get writable() {
    return true;
  }

  flushHeaders() {
    // do nothing
  }
};

module.exports = KoaResponse;