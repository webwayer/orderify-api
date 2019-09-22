import { ISSStatic, SequelizeDataTypes, SequelizeType, SequelizeModel } from '@orderify/io'

export async function UserFactory(
    sequelize: SequelizeType,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class User extends SequelizeModel { }

    User.init({
        name: {
            type: SequelizeDataTypes.STRING(128),
            allowNull: false,
        },
        email: {
            type: SequelizeDataTypes.STRING(128),
            allowNull: false,
        },
    }, {
        tableName: 'User',
        sequelize,
    })

    if (CONFIG.SYNC_SCHEMAS) {
        await User.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return User as unknown as IUserStatic
}

export type IUserStatic = ISSStatic<IUserProps>
interface IUserProps {
    email: string
    name: string
}
