import { DEFAULT_CONFIG, updateConfig, graphqlSchemaFactory } from '@orderify/app'
import { SequelizeFactory } from '@orderify/io'

import { IImageLibrary } from '@orderify/image_library'
import { IWalletOperations } from '@orderify/wallet_operations'

import { compareCampaignsServiceFactory } from '../service'

class StubImageLibraryApi implements IImageLibrary {
    public async findImageById(id: string) {
        if (!id.startsWith('_')) {
            return {
                id,
                userId: 'user1',
                albumId: 'album1',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        }
    }

    public async bulkCreateAlbums(objs) {
        return objs
    }

    public async bulkCreateImages(objs) {
        return objs
    }

    public buildAlbum(obj) {
        return obj
    }

    public buildImage(obj) {
        return obj
    }

    public async findAlbumsByUserId(userId: string) {
        return []
    }

    public async findImagesByUserId(userId: string) {
        return []
    }
}

// tslint:disable-next-line: max-classes-per-file
class StubWalletOperations implements IWalletOperations {
    public async balance(userId: string) {
        return 20
    }

    public async deposit(userId: string, amount: number) {
        return
    }

    public async withdraw(userId: string, amount: number) {
        return
    }
}

export const campaignDefaultFields = ['id', 'userId', 'photo1Id', 'photo2Id', 'status']
export const comparisonDefaultFields = ['id', 'userId', 'campaignId', 'selectedPhotoId']

export const sequelize = SequelizeFactory(updateConfig(DEFAULT_CONFIG, process.env).DATABASE)

export const {
    compareCampaignsGraphql,
    compareCampaigns,
    Campaign,
} = compareCampaignsServiceFactory(sequelize, new StubImageLibraryApi(), new StubWalletOperations())

export const schema = graphqlSchemaFactory(compareCampaignsGraphql)
