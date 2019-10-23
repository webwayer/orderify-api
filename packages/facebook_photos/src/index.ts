export * from './lib/_/PhotoLibraryOnFacebook'
export * from './lib/PhotoLibraryOnFacebook.graphql'
export * from './service'

// tslint:disable-next-line: no-var-requires
export const fbAlbums = require('./test/graphql/fbAlbums')
// tslint:disable-next-line: no-var-requires
export const fbPhotosCover = require('./test/graphql/fbPhotosCover')
// tslint:disable-next-line: no-var-requires
export const fbPhotosProfile = require('./test/graphql/fbPhotosProfile')
