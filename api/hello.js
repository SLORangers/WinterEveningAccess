export async function GET(request) {
  const response = await fetch('https://corsproxy.io/?key=aa313e6b&url=https://developers.google.com/oauthplayground/refreshAccessToken', {
    method: 'POST',
    headers: {
    'Referrer-Policy': 'no-referrer',
       'Access-Control-Allow-Origin': '*',
       'Accept': 'application/json, text/javascript, */*; q=0.01',
       'Content-Type': 'application/json'
    },
    body: JSON.stringify({
       token_uri: 'https://oauth2.googleapis.com/token',
       refresh_token: '1//047hJy9LrGZP9CgYIARAAGAQSNwF-L9Irfp1IVROFH6ryvQT_-HKxoiGNxdAOaWc34mVKxYepy_soIZY9YCXTumLC3spCuBcJZEU'
    })
 });
  const data = await response.json();
  console.log(data);
  return new Response(`Hello from data: ${data}`);

}
export const config = {
};