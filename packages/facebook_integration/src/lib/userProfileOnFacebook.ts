import { FacebookGraph } from './FacebookGraph'
import { IMetadata } from '../../../metadata_storage/src'
import { IUser, Auth } from '@orderify/user_profile'

interface IFacebookAccessData {
    access_token: string
    denied_scopes: string
    expires_in: number
    granted_scopes: string
    token_type: string
}

export class UserProfileOnFacebook {
    constructor(
        private User: IUser,
        private auth: Auth,
        private Metadata: IMetadata,
        private facebookGraph: FacebookGraph,
    ) { }

    public async findByAccessToken(access_token: string) {
        const facebookUserProfile = await this.facebookGraph.makeRequest(access_token, 'me', '', {
            fields: 'email',
        })

        return this.User.findOne({ where: { email: facebookUserProfile.email } })
    }

    public async signUp(accessData: IFacebookAccessData) {
        const facebookUserProfile = await this.facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name',
        })

        const user = await this.User.create({
            email: facebookUserProfile.email,
            name: facebookUserProfile.short_name,
        })

        await this.Metadata.create({
            instanceId: user.id,
            instanceType: 'USER',
            source: 'FACEBOOK.USER',
            userId: user.id,
            data: {
                facebookUserProfile,
                accessData,
            },
        })

        return this.auth.auth(user.id)
    }

    public async signIn(accessData: IFacebookAccessData) {
        const facebookUserProfile = await this.facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name',
        })

        const user = await this.findByAccessToken(accessData.access_token)

        await this.Metadata.update({
            data: {
                facebookUserProfile,
                accessData,
            },
        }, {
            where: {
                instanceId: user.id,
                instanceType: 'USER',
                source: 'FACEBOOK.USER',
            },
        })

        return this.auth.auth(user.id)
    }
}
