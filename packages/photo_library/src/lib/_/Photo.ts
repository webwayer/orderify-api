import { DataTypes, Model, Sequelize } from "sequelize"

class Photo extends Model {
    public readonly albumId!: string
    public readonly alt_text: string

    // Timestamps!
    public readonly createdAt!: Date
    public readonly height!: number
    public readonly id!: number // Note that the `null assertion` `!` is required in strict mode.

    public readonly link!: string

    public readonly name: string
    public readonly updatedAt!: Date
    public readonly userId!: string
    public readonly width!: number
}

export async function PhotoFactory(sequelize: Sequelize, CONFIG: { DROP_ON_SYNC: string; SYNC_SCHEMAS: string }) {
    Photo.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        width: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        height: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: true,
        },
        alt_text: {
            type: new DataTypes.STRING(512),
            allowNull: true,
        },
        link: {
            type: new DataTypes.STRING(256),
            allowNull: false,
        },
        albumId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
    },         {
        tableName: "Photo",
        sequelize,
    },
    )

    if (CONFIG.SYNC_SCHEMAS) {
        await Photo.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Photo
}

export type PhotoType = typeof Photo
interface IPhotoInstance {
    readonly albumId: number
    readonly alt_text?: string
    readonly createdAt: Date
    readonly height: number
    readonly id: number
    readonly link: string
    readonly name?: string
    readonly updatedAt: Date
    readonly userId: number
    readonly width: number
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never
