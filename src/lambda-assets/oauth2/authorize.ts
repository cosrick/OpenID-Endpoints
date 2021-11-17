import { Redirect } from '../helpers';

const base_url = process.env.BASE_URL || '<lambda-domain>';

exports.handler = async function(event: any, _context: any, callback: any) {

  const { client_id, redirect_uri, response_type, scope, state } = event.queryStringParameters;
  const url = base_url + '/twitter/login';

  let redirect = new Redirect(url);
  redirect.set_cookie({
    twitter_oauth2_state: encodeURIComponent(state),
    twitter_oauth2_scope: encodeURIComponent(scope),
    twitter_oauth2_redirect_uri: redirect_uri,
    twitter_oauth2_client_id: client_id,
    twitter_oauth2_response_type: response_type,
  });

  callback(null, redirect);
};