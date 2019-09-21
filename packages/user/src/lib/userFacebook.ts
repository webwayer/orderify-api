import { IMetadataStatic, facebookGraphFactory } from '@orderify/facebook'
import { IUserStatic } from './_/User'

export function userFacebookFactory(
    User: IUserStatic,
    Metadata: IMetadataStatic,
    facebookGraph: ReturnType<typeof facebookGraphFactory>,
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
            sourceId: user.id,
            sourceType: 'FACEBOOK.USER',
            data: {
                facebookUserProfile,
                accessData,
            },
        })

        return user.toJSON()
    }

    async function updateMetadata(userId: number, accessData: IFacebookAccessData) {
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
                sourceId: userId,
                sourceType: 'FACEBOOK.USER',
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
