export class Response {

  private statusCode: number;
  private headers: {[key: string]: any};
  private body: string = '{}';
  private multiValueHeaders: {[key: string]: any} = {};

  constructor(context: {[key: string]: any}, statusCode?: number) {

    if ( statusCode == 500 ) {
      this.statusCode = statusCode;
      this.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      };
      this.set_error(context);
    } else {
      this.statusCode = statusCode || 200;
      this.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      };
      this.set_body(context);
    }
  }

  private set_error(error: {[key: string]: any}) {
    this.body = JSON.stringify(error);
    return this;
  }

  private set_body(content: {[key: string]: any}) {
    this.body = JSON.stringify(content);
    return this;
  }

  public set_cookie( context: {[key: string]: any}) {

    let cookies: string[] = [];
    Object.entries(context).map( ([key, value]) => {
      cookies.push(`${key}=${value} path=/`);
    });
    Object.assign(this.multiValueHeaders, { 'Set-Cookie': cookies });
  }
}

export class Redirect {

  private statusCode: number;
  private headers: {[key: string]: any};
  private body: string | null;
  private multiValueHeaders: {[key: string]: any} = {};

  constructor(url: string) {
    this.statusCode = 302;
    this.headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Location': url,
    };
    this.body = null;
  }

  public set_cookie( context: {[key: string]: any}) {

    let cookies: string[] = [];
    Object.entries(context).map( ([key, value]) => {
      cookies.push(`${key}=${value}; path=/`);
    });
    Object.assign(this.multiValueHeaders, { 'Set-Cookie': cookies });
  }
}