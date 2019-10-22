# Oauth flow
Here we're going to follow a little bit simplified version of standard Oauth2 flow [Authorization Code Flow with Proof Key for Code Exchange (PKCE)](https://auth0.com/docs/flows/concepts/auth-code-pkce)

## `GET {api}/auth/facebook`

```js
// First at all you have to generate enough long random `code_verifier` string
const code_verifier = randomBytes(256)
// Then get `code_challenge` that is sha256 of it as `hex` string
const code_challenge = sha256(code_verifier).toString('hex')
```

After that forward user to the  `GET {api}/auth/facebook` with
```js
const queryParams = {
    code_challenge,
    code_challenge_method: 'S256', // we're using sha256
    redirect_uri: 'http://localhost/', // one of the accepted redirect uris
    state?: 'optional string that comes back to you in the next step unchanged',
}
```

Server will redirect him to `Facebook`, after user entered credentials and granted access he will be redirected to `redirect_uri` with some sweets for you

```js
const url = `${redirect_uri}#code=123&state=optional string that comes back to you in the next step unchanged`
```