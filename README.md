# Oauth flow
Here we're going to follow little bit simplified standard Oauth2 flow [Authorization Code Flow with Proof Key for Code Exchange (PKCE)](https://auth0.com/docs/flows/concepts/auth-code-pkce)

## `GET {api}/auth/facebook`

```js
// First at all you have to generate random `code_challenge` string
const code_challenge = randomBytes(265)
// Then get `code_verifier` that is sha256 of it as `hex` string
const code_verifier = sha256(code_challenge).toString('hex')
```