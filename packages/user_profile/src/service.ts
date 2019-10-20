import { Sequelize } from 'sequelize'

import {
    UserFactory,
    UserProfile,
    UserProfileGraphQLFactory,
} from './'

export function userProfileServiceFactory(
    sequelize: Sequelize,
) {
    const User = UserFactory(sequelize)
    const userProfile = new UserProfile(User)
    const userProfileGraphql = UserProfileGraphQLFactory(userProfile)

    return { User, userProfile, userProfileGraphql }
}
