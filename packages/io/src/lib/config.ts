export const IO_CONFIG = {
    DATABASE: {
        DATABASE_NAME: 'orderify',
        USER: '',
        PASSWORD: '',
        HOST: 'localhost',
        PORT: '5432',
    },
    AWS: {
        KEY: '',
        KEY_ID: '',
        REGION: '',
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
