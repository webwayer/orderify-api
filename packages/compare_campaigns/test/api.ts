import serviceFactory from '../src/service'
import { DEFAULT_CONFIG, graphqlFactory } from '@orderify/app'
import { SequelizeFactory } from '@orderify/io'
import { graphql } from 'graphql'
import { mutation } from './graphqlQuery'
import { IImageLibraryApi } from '@orderify/image_library'

class StubImageLibraryApi implements IImageLibraryApi {
    public async findImageById(id: string) {
        if (!id.startsWith('_')) {
            return {
                id,
                userId: 'user1',
                albumId: 'album1',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            }
        }
    }
}

const sequelize = SequelizeFactory(DEFAULT_CONFIG.DATABASE)
const { compareCampaignsInterface } = serviceFactory(sequelize, new StubImageLibraryApi())
const schema = graphqlFactory(compareCampaignsInterface.query, compareCampaignsInterface.mutation)

describe('Compare Campaigns', () => {
    beforeEach(async () => {
        sequelize.sync({ force: true })
    })

    describe('startCampaign', () => {
        it('success', async () => {
            const result = await graphql({
                schema,
                source: mutation(
                    'startCampaign',
                    { photo1Id: 'photo1', photo2Id: 'photo2' },
                    ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
                ),
                contextValue: {
                    userId: 'user1',
                },
            })

            // tslint:disable-next-line: no-console
            console.log(mutation(
                'startCampaign',
                { photo1Id: 'photo1', photo2Id: 'photo2' },
                ['id', 'userId', 'photo1Id', 'photo2Id', 'comparisonsCount'],
            ))

            // tslint:disable-next-line: no-console
            console.log(result)
        })
    })
})
