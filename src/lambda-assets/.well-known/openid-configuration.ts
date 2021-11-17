import { Response } from '../helpers';

const base_url = process.env.BASE_URL || '<lambda-domain>';
const issuer = process.env.ISSUER || '<issuer-name>';

exports.handler = async function(_event: any, _context: any, callback: any) {

  const configjson = {
    authorization_endpoint: base_url + "/oauth2/authorize",
    id_token_signing_alg_values_supported: [
        "RS256"
    ],
    issuer: issuer,
    jwks_uri: base_url + "/.well-known/jwks.json",
    response_types_supported: [
        "code",
        "token"
    ],
    scopes_supported: [
        "openid",
        "profile",
        "email"
    ],
    subject_types_supported: [
        "public"
    ],
    token_endpoint: base_url + "/oauth2/token",
    token_endpoint_auth_methods_supported: [
        "client_secret_basic"
    ],
    userinfo_endpoint: base_url + "/oauth2/userInfo"
  };

  callback(null, new Response(configjson));
}