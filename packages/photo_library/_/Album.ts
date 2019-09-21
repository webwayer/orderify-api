import { Model, DataTypes, Sequelize } from 'sequelize';

export async function AlbumFactory(sequelize: Sequelize, CONFIG: { SYNC_SCHEMAS: string, DROP_ON_SYNC: string }) {
    class Album extends Model {
        public readonly id!: number; // Note that the `null assertion` `!` is required in strict mode.
        public readonly userId!: string;

        public readonly name: string;

        // timestamps!
        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
    }

    Album.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: true,
        },
    }, {
            tableName: 'Album',
            sequelize
        }
    );

    if (CONFIG.SYNC_SCHEMAS) {
        await Album.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Album;
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
export type AlbumType = Unpromise<ReturnType<typeof AlbumFactory>>