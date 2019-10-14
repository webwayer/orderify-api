import { FacebookGraph } from './_/FacebookGraph'
import { MetadataStorage } from '@orderify/metadata_storage'
import { Auth } from '@orderify/user_profile'

interface IFacebookAccessData {
    access_token: string
    denied_scopes: string
    expires_in: number
    granted_scopes: string
    token_type: string
}

export class UserProfileOnFacebook {
    constructor(
        private auth: Auth,
        private metadataStorage: MetadataStorage,
        private facebookGraph: FacebookGraph,
    ) { }

    public async findAccessTokenByUserId(userId: string) {
        const facebookMetadata = await this.metadataStorage.findByUserId(userId, 'USER', 'FACEBOOK.USER')

        return facebookMetadata[0]?.data?.accessData?.access_token
    }

    public async findByAccessToken(access_token: string) {
        const facebookUserProfile = await this.facebookGraph.makeRequest(access_token, 'me', '', {
            fields: 'email',
        })

        return this.auth.findByEmail(facebookUserProfile.email)
    }

    public async signUp(accessData: IFacebookAccessData) {
        const facebookUserProfile = await this.facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name',
        })

        const user = await this.auth.signUp({
            email: facebookUserProfile.email,
            name: facebookUserProfile.short_name,
        })

        await this.metadataStorage.create({
            instanceId: user.id,
            instanceType: 'USER',
            source: 'FACEBOOK.USER',
            userId: user.id,
            data: {
                facebookUserProfile,
                accessData,
            },
        })

        return this.auth.signIn(user.id)
    }

    public async signIn(accessData: IFacebookAccessData) {
        const facebookUserProfile = await this.facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name',
        })

        const user = await this.findByAccessToken(accessData.access_token)

        await this.metadataStorage.updateByInstanceId({
            data: {
                facebookUserProfile,
                accessData,
            },
        }, user.id, 'USER', 'FACEBOOK.USER')

        return this.auth.signIn(user.id)
    }
}
