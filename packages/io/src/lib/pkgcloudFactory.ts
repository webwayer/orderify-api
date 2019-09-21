import * as pkgcloudlocal from "filesystem-storage-pkgcloud"
import * as pkgcloud from "pkgcloud"

export function pkgcloudFactory() {
    (pkgcloud as any).providers.filesystem = {};
    (pkgcloud as any).providers.filesystem.storage = pkgcloudlocal

    const storageClient = pkgcloud.storage.createClient({
        provider: "filesystem",
        root: "./storage",
    } as any)

    return storageClient
}
