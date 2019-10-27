import { SequelizeFactory, IO_CONFIG, updateConfig, graphqlSchemaFactory } from '@orderify/io'

import { IImageLibrary } from '@orderify/image_library'
import { IWalletOperations } from '@orderify/wallet_operations'

import { COMPARE_CAMPAIGNS_CONFIG } from '../config'

import { compareCampaignsServiceFactory } from '../service'

class StubImageLibraryApi implements IImageLibrary {
    public async findImagesByUserIdAndAlbumId(userId: string, albumId: string) {
        return [{
            id: 'image1',
            userId,
            albumId,
            createdAt: new Date(),
            updatedAt: new Date(),
        }]
    }

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

export const sequelize = SequelizeFactory(updateConfig(IO_CONFIG, process.env).DATABASE)

export const {
    compareCampaignsGraphql,
    compareCampaigns,
    Campaign,
} = compareCampaignsServiceFactory(COMPARE_CAMPAIGNS_CONFIG, sequelize, new StubImageLibraryApi(), new StubWalletOperations())

export const schema = graphqlSchemaFactory(compareCampaignsGraphql)
