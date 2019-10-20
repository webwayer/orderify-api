import { IUser } from './_/User'

export class UserProfile {
    constructor(
        private User: IUser,
    ) { }

    public async findByEmail(email: string) {
        return this.User.findOne({ where: { email } })
    }

    public async create(user: Parameters<IUser['create']>[0]) {
        return this.User.create(user)
    }
}
