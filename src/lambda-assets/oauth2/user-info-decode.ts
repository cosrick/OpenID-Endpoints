import { URLSearchParams } from 'url';
import jwt_decode from 'jwt-decode';
import { Response } from '../helpers';

exports.handler = async function(event: any, _context: any, callback: any) {

  const params = new URLSearchParams(event.body);
  let access_token = params.get('access_token');

  if ( !access_token ) {access_token = event.headers.authorization;}
  callback(null, new Response(jwt_decode(access_token!)));
};
