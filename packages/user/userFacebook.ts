import { FacebookMetadataType } from "../facebook/_/FacebookMetadata"
import { facebookGraphFactory } from "../facebook/facebookGraphFactory"

import { IUserInstance, UserType } from "./_/User"

export function userFacebookFactory(
    User: UserType,
    FacebookMetadata: FacebookMetadataType,
    facebookGraph: ReturnType<typeof facebookGraphFactory>,
) {
    async function findByFacebookAccessToken(access_token: string): Promise<IUserInstance> {
        const facebookUserProfile = await facebookGraph.makeRequest(access_token, "me", "", {
            fields: "email",
        })

        const user = await User.findOne({ where: { email: facebookUserProfile.email } })

        return user ? user.toJSON() as any : undefined
    }

    async function createFromFacebook(accessData: IFacebookAccessData): Promise<IUserInstance> {
        const facebookUserProfile = await facebookGraph.makeRequest(accessData.access_token, "me", "", {
            fields: "email,id,first_name,last_name,middle_name,name,name_format,picture,short_name",
        })

        const user = await User.create({
            email: facebookUserProfile.email,
            name: facebookUserProfile.short_name,
        })

        await FacebookMetadata.create({
            sourceId: user.id,
            sourceType: "USER",
            data: {
                facebookUserProfile,
                accessData,
            },
        })

        return user.toJSON() as any
    }

    async function updateFacebookMetadata(userId: number, accessData: IFacebookAccessData) {
        const facebookUserProfile = await facebookGraph.makeRequest(accessData.access_token, "me", "", {
            fields: "email,id,first_name,last_name,middle_name,name,name_format,picture,short_name",
        })

        await FacebookMetadata.update({
            data: {
                facebookUserProfile,
                accessData,
            },
        }, {
            where: {
                sourceId: userId,
                sourceType: "USER",
            },
        })
    }

    return {
        findByFacebookAccessToken,
        createFromFacebook,
        updateFacebookMetadata,
    }
}

interface IFacebookAccessData {
    access_token: string
    denied_scopes: string
    expires_in: number
    granted_scopes: string
    token_type: string
}
