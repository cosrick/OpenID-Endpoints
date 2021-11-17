// import tojwks from 'rsa-pem-to-jwk';
import { Response } from '../helpers';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { pem2jwk } from 'pem-jwk'

exports.handler = async function(_event: any, _context: any, callback: any) {

  // Get paramater saved in SSM
  const client = new SSMClient({region: 'ap-northeast-1'});
  const command = new GetParameterCommand({
    Name: '/system/twitter-openid-privatekey'
  });
  
  const priv_pem = (await client.send(command)).Parameter?.Value!;

  const jwt =  pem2jwk(priv_pem)
  const r = Object.assign(jwt, {use: 'sig', kid: 'testkeyid', alg: 'RS256'});
  const jwkjson = {
    keys: [r]
  };

  callback(null, new Response(jwkjson));
}