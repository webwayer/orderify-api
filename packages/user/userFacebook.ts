import { UserType, UserInstance } from './_/User'
import { facebookGraphFactory } from '../facebook/facebookGraphFactory'
import { FacebookMetadataType } from '../facebook/_/FacebookMetadata'

export function userFacebookFactory(User: UserType, FacebookMetadata: FacebookMetadataType, facebookGraph: ReturnType<typeof facebookGraphFactory>) {
    async function findByFacebookAccessToken(access_token: string): Promise<UserInstance> {
        const facebookUserProfile = await facebookGraph.makeRequest(access_token, 'me', '', {
            fields: 'email'
        })

        const user = await User.findOne({ where: { email: facebookUserProfile.email } })

        return user ? <any>user.toJSON() : undefined
    }

    async function createFromFacebook(accessData: FacebookAccessData): Promise<UserInstance> {
        const facebookUserProfile = await facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name'
        })

        const user = await User.create({
            email: facebookUserProfile.email,
            name: facebookUserProfile.short_name
        })

        await FacebookMetadata.create({
            sourceId: user.id,
            sourceType: 'USER',
            data: {
                facebookUserProfile,
                accessData
            }
        })

        return <any>user.toJSON()
    }

    async function updateFacebookMetadata(userId: number, accessData: FacebookAccessData) {
        const facebookUserProfile = await facebookGraph.makeRequest(accessData.access_token, 'me', '', {
            fields: 'email,id,first_name,last_name,middle_name,name,name_format,picture,short_name'
        })

        await FacebookMetadata.update({
            data: {
                facebookUserProfile,
                accessData
            }
        }, {
            where: {
                sourceId: userId,
                sourceType: 'USER',
            }
        })
    }

    return {
        findByFacebookAccessToken,
        createFromFacebook,
        updateFacebookMetadata,
    }
}

interface FacebookAccessData {
    access_token: string
    expires_in: number
    token_type: string
    granted_scopes: string
    denied_scopes: string
}