import { ICampaignStatic } from './Campaign'
import { IImageLibraryApi } from '@orderify/image_library'

export class CompareCampaignsApi {
    constructor(private Campaign: ICampaignStatic, private imageLibraryApi: IImageLibraryApi) { }

    public async startCampaign(userId: string, photo1Id: string, photo2Id: string) {
        const photo1 = await this.imageLibraryApi.findImageById(photo1Id)
        const photo2 = await this.imageLibraryApi.findImageById(photo2Id)

        if (photo1 && photo2 && photo1.userId === userId && photo2.userId === userId) {
            return this.Campaign.create({
                userId,
                comparisonsCount: 10,
                photo1Id,
                photo2Id,
            })
        }
    }
}
