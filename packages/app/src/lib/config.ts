export const DEFAULT_CONFIG = {
    DATABASE: {
        DIALECT: 'postgres',
        DATABASE_NAME: 'orderify',
        USER: '',
        PASSWORD: '',
        HOST: 'localhost',
        PORT: '5432',
    },
    STORAGE: {
        PROVIDER: 'amazon',
        KEY: '',
        KEY_ID: '',
        REGION: '',
        BUCKET_NAME: 'orderify-test-images',
    },
    SEQUELIZE: {
        SYNC_SCHEMAS: '1',
        DROP_ON_SYNC: '',
    },
    SESSION: {
        SIGNING_SECRET: 'something',
        HTTPS_ONLY_COOKIES: '1',
    },
    FACEBOOK: {
        CLIENT_ID: '',
        CLIENT_SECRET: '',
        REDIRECT_PATH: 'login/facebook/callback',
    },
    API: {
        HOST: 'localhost',
        PORT: '3000',
        PROTOCOL: 'http',
    },
    WEB: {
        BASE_URL: 'http://localhost:3000',
    },
}

export function updateConfig<T>(defaultConfig: T, PROCESS_ENV: { [key: string]: string }): T {
    const config = { ...defaultConfig }

    for (const [key, value] of Object.entries(PROCESS_ENV)) {
        const config_bundle = key.split('_')[0]
        const config_name = key.split('_').splice(1).join('_')

        if (config[config_bundle]) {
            config[config_bundle][config_name] = value
        }
    }

    return config
}

export type IAppConfig = typeof DEFAULT_CONFIG
