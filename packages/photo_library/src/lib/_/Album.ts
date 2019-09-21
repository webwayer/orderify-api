import { DataTypes, Model, Sequelize } from "sequelize"

export async function AlbumFactory(sequelize: Sequelize, CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string }) {
    class Album extends Model {

        // Timestamps!
        public readonly createdAt!: Date
        public readonly id!: number // Note that the `null assertion` `!` is required in strict mode.

        public readonly name: string
        public readonly updatedAt!: Date
        public readonly userId!: string
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
    },         {
            tableName: "Album",
            sequelize,
        },
    )

    if (CONFIG.SYNC_SCHEMAS) {
        await Album.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Album
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
export type AlbumType = Unpromise<ReturnType<typeof AlbumFactory>>
