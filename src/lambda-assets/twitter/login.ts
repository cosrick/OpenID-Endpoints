import * as crypto from 'crypto';
import querystring from 'querystring';
import axios from 'axios';
import OAuth from 'oauth-1.0a';
import { twitter_info } from '../constant';
import { Response, Redirect } from '../helpers';

const base_url = process.env.BASE_URL || '<lambda-domain>';

exports.handler = async function (_event: any, _context: any, callback: any) {

  const oauth = new OAuth({
    consumer: { key: twitter_info.CONSUMER_KEY, secret: twitter_info.CONSUMER_SECRET },
    signature_method: 'HMAC-SHA1',
    hash_function: (base_string: any, key: any) => crypto.createHmac('sha1', key).update(base_string).digest('base64'),
  });
  const request_data = {
    url: twitter_info.OAUTH_REQUEST_URL,
    method: 'POST',
    data: { oauth_callback: base_url + '/twitter/callback' },
  };
  const authHeader = oauth.toHeader(oauth.authorize(request_data));

  try {
    // axios.post(url, data, config)
    const response = await axios.post(request_data.url, {}, { headers: { ...authHeader } });
    const data = querystring.parse(response.data);
    if (!data.oauth_callback_confirmed) {
      callback(null, new Response({
        message: 'An issue occurred with twitter authentication.',
      }, 500));
    } else {
      //if success redirect the user to the twitter authentication page
      //Step 2: GET oauth/authorize
      callback(null, new Redirect(`${twitter_info.OAUTH_AUTHORIZE_URL}?oauth_token=${data.oauth_token}`));
    }
  } catch (err) {
    callback(null, new Response({
      message: err,
    }, 500));
  }
};
