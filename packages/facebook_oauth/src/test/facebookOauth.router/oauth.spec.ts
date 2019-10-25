import assert from 'assert'

import request from 'supertest'
import nock from 'nock'

import { sequelize, app, code_challenge, code_verifier, pkce } from '../service'

describe('redirect', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })
    it('success', async () => {
        const result = await request(app).get('/auth/facebook').query({
            code_challenge,
            code_challenge_method: 'S256',
            redirect_uri: 'http://localhost/',
        }).redirects(0).expect(302)

        assert(result.header.location)
    })

    it('fail - no code_challenge', async () => {
        await request(app).get('/auth/facebook').expect(500)
    })
})

describe('callback', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })
    afterEach(() => {
        nock.cleanAll()
        nock.enableNetConnect()
    })

    it('success', async () => {
        nock('https://graph.facebook.com:443')
            .get('/v4.0/oauth/access_token')
            .query({
                code: 'facebook_code',
                client_id: 'test_client_id',
                client_secret: 'test_client_secret',
                redirect_uri: 'http://localhost:80/auth/facebook/callback',
            })
            .reply(200, { access_token: 'fb_access_token', token_type: 'bearer', expires_in: 5183776 })

        nock('https://graph.facebook.com:443')
            .get('/me/')
            .query({
                access_token: 'fb_access_token',
                fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name',
            })
            .reply(200, {
                email: 'test@example.com',
                id: 'fb_user_id',
                first_name: 'fb_first_name',
                last_name: 'fb_last_name',
                name: 'fb_first_name fb_last_name',
                name_format: '{first} {last}',
                picture: {
                    data: {
                        height: 50,
                        is_silhouette: false,
                        url: 'https://example.com',
                        width: 50,
                    },
                },
                short_name: 'fb_short_name',
            })

        const result = await request(app).get('/auth/facebook/callback').query({
            code: 'facebook_code',
            granted_scopes: 'user_photos,email,public_profile',
            denied_scopes: '',
            // tslint:disable-next-line: max-line-length
            state: 'eyJjb2RlX2NoYWxsZW5nZSI6ImIxNzk0NzU3YTMzODE0YWFiYjU1MTEzNjIwMDU3M2IxYWEyOWJkNWY2N2U3ZWY4MzI0Y2JiNjg1MGMwODJjZWMiLCJyZWRpcmVjdF91cmkiOiJodHRwOi8vbG9jYWxob3N0LyJ9',
        }).redirects(0).expect(302)

        assert(result.header.location)
    })
})

describe('exchangeCode', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })
    it('success', async () => {
        const code = await pkce.start('user1', code_challenge)

        const result = await request(app).get('/auth/facebook/exchangeCode').query({
            code,
            code_verifier,
        }).expect(200)

        assert(result.body.token)
    })
})
