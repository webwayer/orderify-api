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
    state?: 'optional_string_that_comes_back_to_you_in_the_next_step_unchanged',
    // you're free to use `state` param as you want
}
```

Server will redirect him to `Facebook`  
After user enter credentials and grant access he will be redirected to `redirect_uri` with some sweets for you

```xml
{redirect_uri}#code=123ABC456XYZ&state=optional_string_that_comes_back_to_you_in_the_next_step_unchanged
```

Here we're seeing `code` and `state` params as part of `#` hash of the url

## `GET {api}/auth/facebook/exchangeCode`

Okay, now to get actuall `accessToken` you have to exchange code for it

Make a request to  `GET {api}/auth/facebook/exchangeCode` with

```js
const queryParams = {
    code,
    code_verifier, // we generated it at the first step, rememeber?
}
```