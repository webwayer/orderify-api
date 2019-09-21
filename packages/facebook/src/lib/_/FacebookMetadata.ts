import { DataTypes, Model, Sequelize } from "sequelize"

export async function FacebookMetadataFactory(
    sequelize: Sequelize,
    CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string },
) {
    class FacebookMetadata extends Model {

        // Timestamps!
        public readonly createdAt!: Date
        public readonly data!: any
        public readonly sourceId!: number
        public readonly sourceType!: string
        public readonly updatedAt!: Date
    }

    FacebookMetadata.init({
        sourceId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        sourceType: {
            type: DataTypes.STRING(128),
            allowNull: false,
            primaryKey: true,
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    }, {
        tableName: "FacebookMetadata",
        sequelize,
    },
    )

    if (CONFIG.SYNC_SCHEMAS) {
        await FacebookMetadata.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return FacebookMetadata
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
export type FacebookMetadataType = Unpromise<ReturnType<typeof FacebookMetadataFactory>>
