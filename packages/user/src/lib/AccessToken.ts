import { ISSStatic, SequelizeDataTypes, SequelizeType, SequelizeModel } from '@orderify/io'

export async function AccessTokenFactory(
    sequelize: SequelizeType,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class AccessToken extends SequelizeModel { }

    AccessToken.init({
        userId: {
            type: SequelizeDataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    }, {
        tableName: 'AccessToken',
        sequelize,
    })

    if (CONFIG.SYNC_SCHEMAS) {
        await AccessToken.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return AccessToken as unknown as IAccessTokenStatic
}

export type IAccessTokenStatic = ISSStatic<IAccessTokenProps>
interface IAccessTokenProps {
    userId: number
}
