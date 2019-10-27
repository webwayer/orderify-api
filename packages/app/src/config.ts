import { IO_CONFIG } from '@orderify/io'
import { OAUTH_SERVER_CONFIG } from '@orderify/oauth_server'
import { FACEBOOK_OAUTH_CONFIG } from '@orderify/facebook_oauth'
import { IMAGE_LIBRARY_CONFIG } from '@orderify/image_library'
import { COMPARE_CAMPAIGNS_CONFIG } from '@orderify/compare_campaigns'

export const DEFAULT_APP_CONFIG = { ...IO_CONFIG, ...OAUTH_SERVER_CONFIG, ...FACEBOOK_OAUTH_CONFIG, ...IMAGE_LIBRARY_CONFIG, ...COMPARE_CAMPAIGNS_CONFIG }
