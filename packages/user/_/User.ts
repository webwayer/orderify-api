import { Model, DataTypes, Sequelize } from 'sequelize';

export async function UserFactory(sequelize: Sequelize, CONFIG: { SYNC_SCHEMAS: string, DROP_ON_SYNC: string }) {
    class User extends Model {
        public readonly id!: number; // Note that the `null assertion` `!` is required in strict mode.
        public readonly name!: string;
        public readonly email!: string;

        // timestamps!
        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
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
        }
    }, {
            tableName: 'User',
            sequelize
        }
    );

    if (CONFIG.SYNC_SCHEMAS) {
        await User.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return User;
}

export type UserType = Unpromise<ReturnType<typeof UserFactory>>
export interface UserInstance {
    id: number,
    name: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;