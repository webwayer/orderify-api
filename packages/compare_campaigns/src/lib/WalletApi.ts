import { IWalletStatic } from './Wallet'

export class WalletApi {
    constructor(private Wallet: IWalletStatic) { }

    public async deposit(userId: string, amount: number) {
        const wallet = (await this.Wallet.findOne({
            where: {
                userId,
            },
        })) || (await this.Wallet.create({
            userId,
        }))

        await this.Wallet.update({
            balance: wallet.balance + amount,
        }, {
            where: {
                userId,
            },
        })
    }

    public async withdraw(userId: string, amount: number) {
        const wallet = await this.Wallet.findOne({
            where: {
                userId,
            },
        })

        if (!wallet || wallet.balance < amount) {
            throw new Error('not enough points')
        }

        await this.Wallet.update({
            balance: wallet.balance - amount,
        }, {
            where: {
                userId,
            },
        })
    }

    public async balance(userId: string) {
        const wallet = await this.Wallet.findOne({
            where: {
                userId,
            },
        })

        return wallet ? wallet.balance : 0
    }
}
