import { URLSearchParams } from 'url';
import { Response } from '../helpers';
import { make_tokens, make_access_token } from '../utils';

exports.handler = async function(event: any, _context: any, callback: any) {

  const params = new URLSearchParams(event.body);
  const grant_type = params.get('grant_type');

  if ( grant_type == 'authorization_code' || grant_type == 'refresh_token') {
    let code = grant_type == 'refresh_token' ? params.get('refresh_token') : params.get('code');

    code = Buffer.from(code!, 'hex').toString('ascii');
    const codeList = code.split(':');

    const client_id = codeList[0];
    const user_id = codeList[1];
    const scope = codeList[2];
    const username = codeList[3];
    const email = codeList[4];
    const profileImageUrl = codeList[5];

    const tokens = await make_tokens({
      client_id: client_id,
      user_id: user_id,
      scope: scope,
      username: username,
      email: email,
      profileImageUrl: profileImageUrl,
      refresh: grant_type != 'refresh_token',
    });

    console.log('TOKENs:' + JSON.stringify(tokens, null, 2));
    callback(null, new Response(tokens));
  } else if ( grant_type == 'client_credentials') {
    var scope = params.get('scope')!;
    var client_id = params.get('client_id')!;

    var tokens = make_access_token({
      client_id: client_id,
      scope: scope,
    });

    callback(null, new Response(tokens));
  }
};