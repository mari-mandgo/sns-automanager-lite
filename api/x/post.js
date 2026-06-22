const crypto = require("node:crypto");

const X_CREATE_POST_URL = "https://api.x.com/2/tweets";
const ALLOWED_ACCOUNT = "まり教育AI";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function percentEncode(value) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function buildOAuthHeader({ method, url }) {
  const apiKey = requiredEnv("X_API_KEY");
  const apiKeySecret = requiredEnv("X_API_KEY_SECRET");
  const accessToken = requiredEnv("X_ACCESS_TOKEN");
  const accessTokenSecret = requiredEnv("X_ACCESS_TOKEN_SECRET");

  const oauthParams = {
    oauth_consumer_key: apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0"
  };

  const paramString = Object.keys(oauthParams)
    .sort()
    .map(key => `${percentEncode(key)}=${percentEncode(oauthParams[key])}`)
    .join("&");
  const signatureBase = [
    method.toUpperCase(),
    percentEncode(url),
    percentEncode(paramString)
  ].join("&");
  const signingKey = `${percentEncode(apiKeySecret)}&${percentEncode(accessTokenSecret)}`;
  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  const headerParams = {
    ...oauthParams,
    oauth_signature: signature
  };

  return "OAuth " + Object.keys(headerParams)
    .sort()
    .map(key => `${percentEncode(key)}="${percentEncode(headerParams[key])}"`)
    .join(", ");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const postSecret = requiredEnv("SNS_POST_SECRET");
    if (req.headers["x-post-secret"] !== postSecret) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    const { account, text } = req.body || {};
    if (account !== ALLOWED_ACCOUNT) {
      return res.status(403).json({ ok: false, error: "account_not_allowed" });
    }
    if (!text || typeof text !== "string") {
      return res.status(400).json({ ok: false, error: "missing_text" });
    }
    if (text.length > 25000) {
      return res.status(400).json({ ok: false, error: "text_too_long" });
    }

    const response = await fetch(X_CREATE_POST_URL, {
      method: "POST",
      headers: {
        "Authorization": buildOAuthHeader({
          method: "POST",
          url: X_CREATE_POST_URL
        }),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "x_api_error",
        detail: data
      });
    }

    const tweetId = data?.data?.id || "";
    return res.status(200).json({
      ok: true,
      id: tweetId,
      url: tweetId ? `https://x.com/i/web/status/${tweetId}` : ""
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      error: error.message || "server_error"
    });
  }
};
