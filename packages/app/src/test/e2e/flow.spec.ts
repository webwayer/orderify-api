import { app, sequelize } from '../app'
import { graphqlQuery, graphqlMutation } from '@orderify/io'
import request from 'supertest'
import nock from 'nock'
import { fbAlbums, fbPhotosProfile, fbPhotosCover } from '@orderify/facebook_photos'

describe('APP', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })
    it('e2e', async () => {
        const code_challenge = 'b1794757a33814aabb551136200573b1aa29bd5f67e7ef8324cbb6850c082cec'
        const code_verifier = 'code_verifier_string'

        const { state, link } = await getFacebookOauthLink(code_challenge)

        // tslint:disable-next-line: no-console
        console.log(`> REDIRECT: ${link}`)

        const { code } = await sendFacebookCodeToApp(state)

        // tslint:disable-next-line: no-console
        console.log(`> CODE: ${code}`)

        const { accessToken } = await exchangeCodeForAccessToken(code, code_verifier)

        // tslint:disable-next-line: no-console
        console.log(`> TOKEN: ${accessToken}`)

        const { me } = await getMe(accessToken)

        // tslint:disable-next-line: no-console
        console.log(`> ME: ${JSON.stringify(me)}`)

        const { facebookAlbums } = await getFacebookAlbums(accessToken)

        // tslint:disable-next-line: no-console
        console.log('> FACEBOOK ALBUMS COUNT: ' + facebookAlbums.length)

        const { result } = await performFacebookAlbumsSync(accessToken, ['1741869492762915'])

        // tslint:disable-next-line: no-console
        console.log('> SYNC: ' + result)

        const { albums } = await getUserAlbums(accessToken)

        // tslint:disable-next-line: no-console
        console.log('> ALBUMS COUNT: ' + albums.length)

        const { images } = await getAlbumImages(accessToken, albums[1].id)

        // tslint:disable-next-line: no-console
        console.log('> IMAGES COUNT (profile, #1 album): ' + images.length)
    })
})

async function getFacebookOauthLink(code_challenge: string) {
    const result = await request(app).get('/auth/facebook').query({
        code_challenge,
        code_challenge_method: 'S256',
        redirect_uri: 'http://localhost/',
    }).redirects(0).expect(302)

    const state = result.header.location.split('?')[1].split('&')[3].split('=')[1]

    return { state, link: result.header.location }
}

async function sendFacebookCodeToApp(state: string) {
    nock('https://graph.facebook.com:443')
        .get('/v4.0/oauth/access_token')
        .query({
            code: 'facebook_code',
            client_id: '',
            client_secret: '',
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
        state,
    }).redirects(0).expect(302)

    const code = result.header.location.split('#')[1].split('&')[0].split('=')[1]

    return { code }
}

async function exchangeCodeForAccessToken(code: string, code_verifier: string) {
    const result = await request(app).get('/auth/facebook/exchangeCode').query({
        code,
        code_verifier,
    }).expect(200)

    const accessToken = result.body.token

    return { accessToken }
}

async function getMe(accessToken: string) {
    const result = await request(app).get('/').query({
        query: graphqlQuery({
            name: 'me',
            fields: ['id', 'name', 'email'],
        }),
    }).set({
        Authorization: `Bearer ${accessToken}`,
    }).expect(200)

    return { me: result.body.data.me }
}

async function getFacebookAlbums(accessToken: string) {
    nock('https://graph.facebook.com:443')
        .get('/me/albums')
        .query({ access_token: 'fb_access_token', limit: '1000', fields: 'name,type,created_time,updated_time' })
        .reply(200, fbAlbums)

    const result = await request(app).get('/').query({
        query: graphqlQuery({
            name: 'facebookAlbums',
            fields: ['id', 'name', 'type', 'created_time', 'updated_time'],
        }),
    }).set({
        Authorization: `Bearer ${accessToken}`,
    }).expect(200)

    return { facebookAlbums: result.body.data.facebookAlbums }
}

async function performFacebookAlbumsSync(accessToken: string, albumIds: string[]) {
    nock('https://graph.facebook.com:443')
        .get('/me/albums')
        .query({ access_token: 'fb_access_token', limit: '1000', fields: 'name,type,created_time,updated_time' })
        .reply(200, fbAlbums)

    nock('https://graph.facebook.com:443')
        .get('/1527001787583021/photos')
        .query({ access_token: 'fb_access_token', limit: '1000', fields: 'name,alt_text,images,created_time,updated_time,album' })
        .reply(200, fbPhotosProfile)

    nock('https://graph.facebook.com:443')
        .get('/1741869492762915/photos')
        .query({ access_token: 'fb_access_token', limit: '1000', fields: 'name,alt_text,images,created_time,updated_time,album' })
        .reply(200, fbPhotosCover)

    const result = await request(app).post('/').query({
        query: graphqlMutation({
            name: 'facebookAlbumsSync',
            args: { albumIds },
            fields: ['result'],
        }),
    }).set({
        Authorization: `Bearer ${accessToken}`,
    }).expect(200)

    return { result: result.body.data.facebookAlbumsSync.result }
}

async function getUserAlbums(accessToken: string) {
    const result = await request(app).post('/').query({
        query: graphqlQuery({
            name: 'albums',
            fields: ['id', 'name'],
        }),
    }).set({
        Authorization: `Bearer ${accessToken}`,
    }).expect(200)

    return { albums: result.body.data.albums }
}

async function getAlbumImages(accessToken: string, albumId: string) {
    const result = await request(app).post('/').query({
        query: graphqlQuery({
            name: 'images',
            args: { albumId },
            fields: ['id', 'link'],
        }),
    }).set({
        Authorization: `Bearer ${accessToken}`,
    }).expect(200)

    return { images: result.body.data.images }
}
