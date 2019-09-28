import { IFacebookGraph } from './facebookGraphFactory'
import { IMetadataStatic } from '../../../metadata_storage/src'
import { IUserStatic } from '@orderify/user_profile'

export function userFacebookFactory(
    User: IUserStatic,
    Metadata: IMetadataStatic,
    facebookGraph: IFacebookGraph,
) {
    async function findByFacebookAccessToken(access_token: string) {
        const facebookUserProfile = await facebookGraph.makeRequest(access_token, 'me', '', {
            fields: 'email',
        })

        const user = await User.findOne({ where: { email: facebookUserProfile.email } })

        return user ? user.toJSON() : undefined
    }

    async function createFromFacebook(accessData: IFacebookAccessData) {
        const facebookUserProfile = await facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name',
        })

        const user = await User.create({
            email: facebookUserProfile.email,
            name: facebookUserProfile.short_name,
        })

        await Metadata.create({
            instanceId: user.id,
            instanceType: 'USER',
            source: 'FACEBOOK',
            data: {
                facebookUserProfile,
                accessData,
            },
        })

        return user.toJSON()
    }

    async function updateMetadata(userId: string, accessData: IFacebookAccessData) {
        const facebookUserProfile = await facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name',
        })

        await Metadata.update({
            data: {
                facebookUserProfile,
                accessData,
            },
        }, {
            where: {
                instanceId: userId,
                instanceType: 'USER',
                source: 'FACEBOOK.USER',
            },
        })
    }

    return {
        findByFacebookAccessToken,
        createFromFacebook,
        updateMetadata,
    }
}

interface IFacebookAccessData {
    access_token: string
    denied_scopes: string
    expires_in: number
    granted_scopes: string
    token_type: string
}