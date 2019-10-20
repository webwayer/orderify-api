import { FacebookGraph } from './_/FacebookGraph'
import { MetadataStorage } from '@orderify/metadata_storage'
import { UserProfile } from '@orderify/user_profile'

interface IFacebookAccessData {
    access_token: string
    denied_scopes: string
    expires_in: number
    granted_scopes: string
    token_type: string
}

export class UserProfileOnFacebook {
    constructor(
        private userProfile: UserProfile,
        private facebookGraph: FacebookGraph,
        private metadataStorage: MetadataStorage,
    ) { }

    public async findAccessTokenByUserId(userId: string) {
        const facebookMetadata = await this.metadataStorage.findByInstanceId(userId)

        return facebookMetadata?.accessData?.access_token
    }

    public async createOrUpdate(accessData: IFacebookAccessData) {
        const facebookUserProfile = await this.facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name',
        })

        if (!facebookUserProfile.email) {
            throw new Error('cant get email from fb')
        }

        const user = await this.userProfile.findByEmail(facebookUserProfile.email) || await this.userProfile.create({
            email: facebookUserProfile.email,
            name: facebookUserProfile.short_name,
        })

        const metadata = await this.metadataStorage.updateByInstanceId(user.id, {
            data: {
                facebookUserProfile,
                accessData,
            },
        }) || await this.metadataStorage.create({
            instanceId: user.id,
            userId: user.id,
            data: {
                facebookUserProfile,
                accessData,
            },
        })

        return user
    }
}
