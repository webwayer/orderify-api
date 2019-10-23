import assert from 'assert'

import { graphql } from 'graphql'

import { graphqlQuery } from '@orderify/io'

import { schema, sequelize, imageLibraty } from '../service'

describe('Image Library', () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true })
    })

    describe('albums', () => {
        it('success', async () => {
            await imageLibraty.bulkCreateAlbums([
                {
                    userId: 'user1',
                    name: 'album1',
                },
                {
                    userId: 'user1',
                    name: 'album2',
                },
                {
                    userId: 'user2',
                    name: 'album3',
                },
            ])

            const result = await graphql({
                schema,
                source: graphqlQuery({
                    name: 'albums',
                    fields: ['id', 'name', 'userId'],
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.albums.length, 2)
        })
    })

    describe('images', () => {
        it('success', async () => {
            await imageLibraty.bulkCreateImages([
                {
                    userId: 'user1',
                    albumId: 'album1',
                },
                {
                    userId: 'user1',
                    albumId: 'album2',
                },
                {
                    userId: 'user2',
                    albumId: 'album3',
                },
            ])

            const result = await graphql({
                schema,
                source: graphqlQuery({
                    name: 'images',
                    args: { albumId: 'album1' },
                    fields: ['id', 'albumId', 'userId', 'link'],
                }),
                contextValue: {
                    userId: 'user1',
                },
            })

            assert.equal(result.data.images.length, 1)
        })
    })
})
