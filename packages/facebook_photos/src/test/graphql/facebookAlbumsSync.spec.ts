import assert from 'assert'
import nock from 'nock'
import { graphql } from 'graphql'
import { graphqlMutation, graphqlQuery } from '@orderify/io'

import {
    sequelize,
    schema,
} from '../service'

describe('Facebook photos', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    describe('facebookAlbums', () => {
        it('success', async () => {
            nock('https://graph.facebook.com:443')
                .get('/me/albums')
                .query({ access_token: 'fb_access_token', limit: '1000', fields: 'name,type,created_time,updated_time' })
                .reply(200, require('./fbAlbums'))

            const result = await graphql({
                schema,
                source: graphqlQuery({
                    name: 'facebookAlbums',
                    fields: ['id', 'name', 'type', 'created_time', 'updated_time'],
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.facebookAlbums.length, 15)
        })
    })

    describe('facebookAlbumsSync', () => {
        it('success', async () => {
            nock('https://graph.facebook.com:443')
                .get('/me/albums')
                .query({ access_token: 'fb_access_token', limit: '1000', fields: 'name,type,created_time,updated_time' })
                .reply(200, require('./fbAlbums'))

            nock('https://graph.facebook.com:443')
                .get('/1527001787583021/photos')
                .query({ access_token: 'fb_access_token', limit: '1000', fields: 'name,alt_text,images,created_time,updated_time,album' })
                .reply(200, require('./fbPhotosProfile'))

            nock('https://graph.facebook.com:443')
                .get('/1741869492762915/photos')
                .query({ access_token: 'fb_access_token', limit: '1000', fields: 'name,alt_text,images,created_time,updated_time,album' })
                .reply(200, require('./fbPhotosCover'))

            const result = await graphql({
                schema,
                source: graphqlMutation({
                    name: 'facebookAlbumsSync',
                    args: { albumIds: ['1741869492762915'] },
                    fields: ['result'],
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.facebookAlbumsSync.result, true)
        })
    })
})
