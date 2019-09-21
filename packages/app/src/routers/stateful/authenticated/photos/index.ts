import { Router } from "express"

import { photoLibraryFactory, photoStorageFactory } from "@orderify/photo_library"

export function photosRouterFactory(
    router: Router,
    photoStorage: ReturnType<typeof photoStorageFactory>,
    photoLibrary: ReturnType<typeof photoLibraryFactory>,
) {
    router.get("/", (req, res) => {
        res.send("Hello World")
    })

    router.get("/albums", async (req, res) => {
        res.json(await photoLibrary.getAlbumsByUserId(req.session.userId))
    })

    router.get("/photos", async (req, res) => {
        res.json(await photoLibrary.getPhotosByUserId(req.session.userId))
    })

    router.get("/photos/:id/download", async (req, res) => {
        const photo = await photoLibrary.getPhotoById(Number(req.params.id), req.session.userId)
        if (photo) {
            photoStorage.downloadAsStream(photo.id).pipe(res)
        } else {
            res.end()
        }
    })

    return router
}
