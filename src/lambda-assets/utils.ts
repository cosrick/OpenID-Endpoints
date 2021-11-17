import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import * as jwt from 'jsonwebtoken';

const base_url = process.env.BASE_URL || 'https://localhost:10443';
const page_url = process.env.PAGE_URL || 'https://localhost:10443/';
const issuer = process.env.ISSUER || 'https://localhost:10443';
const login_url = process.env.LOGIN_URL || (page_url + '/login/login.html');
const keyid = process.env.KEYID || 'testkeyid';
const expire = 60 * 60;

interface MakeWechatTokensInput {
  readonly client_id: string;
  readonly user_id: string;
  readonly scope: string;
  readonly username: string;
  readonly profileImageUrl: string;
  readonly code: string;
  readonly refresh?: boolean;
}

interface MakeTokensInput {
  readonly client_id: string;
  readonly user_id: string;
  readonly scope: string;
  readonly username: string;
  readonly email: string;
  readonly profileImageUrl: string;
  readonly refresh?: boolean;
}

interface MakeAccessTokenInput {
  readonly client_id: string;
  readonly scope: string;
}

export async function make_tokens(props: MakeTokensInput): Promise<{ [key: string]: any }> {

  const client = new SSMClient({ region: 'ap-northeast-1' });
  const command = new GetParameterCommand({
    Name: '/system/twitter-openid-privatekey',
  });

  const priv_pem_string = (await client.send(command)).Parameter?.Value!;

  console.log(priv_pem_string);
  const priv_pem = Buffer.from(priv_pem_string);

  const payload_id = {
    'token_use': 'id',
    'cognito:username': props.user_id,
    'email': props.email,
    'name': props.username,
    'profileImage': props.profileImageUrl,
  };

  const id_token = jwt.sign(payload_id, priv_pem, {
    algorithm: 'RS256',
    expiresIn: expire,
    audience: props.client_id,
    issuer: issuer,
    subject: props.user_id,
    keyid: keyid,
  });

  const payload_access_token = {
    'token_use': 'access',
    'scope': props.scope,
    'namename': props.user_id,
    'cognito:username': props.user_id,
    'email': props.email,
    'name': props.username,
    'profileImage': props.profileImageUrl,
    'email_verified': false,
    'client_id': props.client_id,
  };

  const access_token = jwt.sign(payload_access_token, priv_pem, {
    algorithm: 'RS256',
    expiresIn: expire,
    audience: props.client_id,
    issuer: issuer,
    subject: props.user_id,
    keyid: keyid,
  });

  let tokens: {[key:string]: any} = {
    access_token: access_token,
    id_token: id_token,
    token_type: 'Bearer',
    expires_in: expire,
  };

  if ( !props.refresh ) {

    const codeInfo = [props.client_id, props.user_id, props.scope, props.username, props.email, props.profileImageUrl].join(':');
    const refresh_token = Buffer.from(codeInfo).toString('hex');

    tokens.refresh_token = refresh_token;
  }

  return tokens;
}

export async function make_access_token(props: MakeAccessTokenInput): Promise<{ [key: string]: any }> {

  const client = new SSMClient({ region: 'ap-northeast-1' });
  const command = new GetParameterCommand({
    Name: '/system/twitter-openid-privatekey',
  });

  const priv_pem_string = (await client.send(command)).Parameter?.Value!;
  const priv_pem = Buffer.from(priv_pem_string);

  var payload_access_token = {
    token_use: 'access',
    scope: props.scope,
    client_id: props.client_id,
  };
  var access_token = jwt.sign(payload_access_token, priv_pem, {
    algorithm: 'RS256',
    expiresIn: expire,
    issuer: issuer,
    subject: props.client_id,
    keyid: keyid,
  });

  var tokens = {
    access_token: access_token,
    token_type: 'Bearer',
    expires_in: expire,
  };
  return tokens;
}

export async function make_wechat_tokens(props: MakeWechatTokensInput) {

  const client = new SSMClient({ region: 'ap-northeast-1' });
  const command = new GetParameterCommand({
    Name: '/system/twitter-openid-privatekey',
  });

  const priv_pem_string = (await client.send(command)).Parameter?.Value!;

  console.log(priv_pem_string);
  const priv_pem = Buffer.from(priv_pem_string);

  const payload_id = {
    'token_use': 'id',
    'cognito:username': props.user_id,
    'name': props.username,
    'profileImage': props.profileImageUrl,
  };

  const id_token = jwt.sign(payload_id, priv_pem, {
    algorithm: 'RS256',
    expiresIn: expire,
    audience: props.client_id,
    issuer: issuer,
    subject: props.user_id,
    keyid: keyid,
  });

  const payload_access_token = {
    token_use: 'access',
    scope: props.scope,
    namename: props.user_id,
    name: props.username,
    profileImage: props.profileImageUrl,
    email_verified: false,
    client_id: props.client_id,
  };

  const access_token = jwt.sign(payload_access_token, priv_pem, {
    algorithm: 'RS256',
    expiresIn: expire,
    audience: props.client_id,
    issuer: issuer,
    subject: props.user_id,
    keyid: keyid,
  });

  let tokens: {[key:string]: any} = {
    access_token: access_token,
    id_token: id_token,
    token_type: 'Bearer',
    expires_in: expire,
  };

  const refresh = props.refresh ?? true;
  if ( refresh ) {
    tokens.refresh_token = props.code;
  }

  return tokens;

}
