import { IDatabase } from '@orderify/io'

export async function UserFactory(
    { DataTypes, Model, sequelize }: IDatabase,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class User extends Model {
        // Timestamps!
        public readonly createdAt!: Date
        public readonly email!: string
        public readonly id!: number // Note that the `null assertion` `!` is required in strict mode.
        public readonly name!: string
        public readonly updatedAt!: Date
    }

    User.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        email: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
    }, {
        tableName: 'User',
        sequelize,
    },
    )

    if (CONFIG.SYNC_SCHEMAS) {
        await User.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return User
}

export type UserType = Unpromise<ReturnType<typeof UserFactory>>
export interface IUserInstance {
    createdAt: Date
    email: string
    id: number
    name: string
    updatedAt: Date
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
