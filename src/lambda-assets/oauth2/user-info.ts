import { Response } from '../helpers';

exports.handler = async function(event: any, _context: any, callback: any) {

  const token = event.requestContext.authorizer.claims;
  callback(null, new Response(token));
};