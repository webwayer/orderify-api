import pkgcloudlocal from "filesystem-storage-pkgcloud"
import pkgcloud, { storage } from "pkgcloud"

export function pkgcloudFactory() {
    (pkgcloud as any).providers.filesystem = {};
    (pkgcloud as any).providers.filesystem.storage = pkgcloudlocal

    const storageClient = pkgcloud.storage.createClient({
        provider: "filesystem",
        root: "./storage",
    } as any)

    return storageClient
}

export type IStorageClient = storage.Client
