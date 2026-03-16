import 'dotenv/config';
// lib/shopify.js (or wherever you keep your config files)
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion,} from '@shopify/shopify-api';


const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(','),
  hostName: process.env.HOST_NAME.replace(/https?:\/\//, ''),
  apiVersion: ApiVersion.October25, // Always stays up to date
  isEmbeddedApp: true,
});

export default shopify;