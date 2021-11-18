import * as crypto from 'crypto';
import { URLSearchParams } from 'url';
import axios from 'axios';
import OAuth from 'oauth-1.0a';
import { twitter_info } from '../constant';
import { Response, Redirect } from '../helpers';

exports.handler = async function(event: any, _context: any, callback: any) {

  const { oauth_token, oauth_verifier } = event.queryStringParameters;

  if (!oauth_token || !oauth_verifier) {
    callback(null, new Response({
      message: 'Twitter authentication failed.',
    }, 500));
  } else {
    const oauth = new OAuth({
      consumer: { key: twitter_info.CONSUMER_KEY, secret: twitter_info.CONSUMER_SECRET },
      signature_method: 'HMAC-SHA1',
      hash_function: (base_string, key) => crypto.createHmac('sha1', key).update(base_string).digest('base64'),
    });
    const tokenRequestData = {
      url: twitter_info.OAUTH_ACCESS_URL,
      method: 'POST',
      data: { oauth_verifier },
    };
    const token = { key: oauth_token, secret: '' };
    let authHeader = oauth.toHeader(oauth.authorize(tokenRequestData, token));

    //if this request succeeds the user is now autehtnicated
    const res = await axios.post(tokenRequestData.url, {}, { headers: { ...authHeader } });

    const response_data = new URLSearchParams(res.data);
    const twitter_oauth_token = response_data.get('oauth_token');
    const twitter_oauth_token_secret = response_data.get('oauth_token_secret');

    //but we don't have access to all the data we need to create or update their profile
    //so we also request that
    const userRequestData = {
      url: twitter_info.USER_PROFILE_URL,
      method: 'GET',
    };
    const accessToken = { key: twitter_oauth_token!, secret: twitter_oauth_token_secret! };

    authHeader = oauth.toHeader(oauth.authorize(userRequestData, accessToken));
    const { data: profileData } = await axios({
      method: 'GET',
      url: userRequestData.url,
      headers: { ...authHeader },
    });

    const cookie = parseCookie(event.headers.Cookie);
    const userid = profileData.id_str;
    const username = profileData.name;
    const email = profileData.email;
    const profileImageUrl = profileData.profile_image_url_https;

    let code = [cookie.twitter_oauth2_client_id, userid, cookie.twitter_oauth2_scope, username, email, profileImageUrl].join(':');
    code = Buffer.from(code, 'ascii').toString('hex');

    const idpresponseUrl = `${cookie.twitter_oauth2_redirect_uri}?code=${code}&state=${cookie.twitter_oauth2_state}`;

    callback(null, new Redirect(idpresponseUrl));
  }
};

function parseCookie(cookieStrings: string): {[key: string]: any} {
  const cookieList = cookieStrings.split('; ');

  let cookieObject = {};
  cookieList.map( (cookieString) => {
    let cookiePair = cookieString.split('=');
    const key = cookiePair.shift()!;
    const value = cookiePair.join('=');
    Object.assign(cookieObject, { [key]: value });
  });

  return cookieObject;
}