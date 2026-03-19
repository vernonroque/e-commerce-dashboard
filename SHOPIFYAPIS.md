## This url helps you get the next url below that has the code for the access token

https://santa-sierra-coffee.myshopify.com/admin/oauth/authorize?client_id={your-client-id}&redirect_uri={your-redirect-uri}

## You recieve this url that has the code to recieve the access token

http://localhost/?code={This-is-the-code}&hmac=eb5c7a4ec3f8fba0ce26ec72264bcbc66272bfdbe64d10028997e1e45c3c44e5&host=YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvc2FudGEtc2llcnJhLWNvZmZlZQ&shop=santa-sierra-coffee.myshopify.com&timestamp=1773630577

## This api endpoint helps you get the access token

http://{your-shop-name}.myshopify.com/admin/oauth/access_token

## You send a post request to the above url with the following body:

## These are the query parameters

{
"client_id": "{your-client-id}",
"client_secret": "{your-client-secret}",
"code": "{the-code-you-received}"
}

## The typical OAuth flow:

User clicks "Install app"
→ Shopify OAuth (/authorize)
→ redirect_uri (/auth/shopify/callback) [backend]
→ you exchange token
→ redirect to App URL (/app) [frontend UI]

## these are the query parameters from the callback:

Received callback query parameters >>> [Object: null prototype] {
backend-api  |   code: 'b57810deb7012788a7c8511a81d0b8c6',
backend-api  |   hmac: 'c854a208f62affdfa3fdb9580319ffd7ed201a9f23acb80b57cf22712f84f53e',
backend-api  |   host: 'YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvc2FudGEtc2llcnJhLWNvZmZlZQ',
backend-api  |   shop: 'santa-sierra-coffee.myshopify.com',
backend-api  |   timestamp: '1773881442'
backend-api  | }

## access the dev db in the docker container:
docker exec -it dev-mysql mysql -u root -p
