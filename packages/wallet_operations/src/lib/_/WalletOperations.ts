import { IWallet } from './_/Wallet'

export class WalletOperations {
    constructor(private Wallet: IWallet) { }

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
            throw new Error('not enough funds')
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

        return wallet?.balance || 0
    }
}

type PublicPart<T> = { [K in keyof T]: T[K] }
export type IWalletOperations = PublicPart<WalletOperations>
