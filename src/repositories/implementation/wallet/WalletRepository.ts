import { Types } from "mongoose";
import Wallet, { IWallet, IWalletTransaction } from "../../../model/userWallet/userWalletModal";
import { BaseRepository } from "../../base/BaseRepository";
import IWalletRepository from "../../interfaces/wallet/IWalletRepository";


class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {


    constructor() {
        super(Wallet)
    }
    async findByUserId(userId: Types.ObjectId): Promise<IWallet | null> {
        return await Wallet.findOne({ userId })
    }
    async createWalletForUser(userId: Types.ObjectId): Promise<IWallet> {
        return await Wallet.create({
            userId,
            balance: 0,
            transactions: []
        })
    }
    async addTransactionAndUpdateBalance(userId: Types.ObjectId, transaction: IWalletTransaction): Promise<IWallet> {
        const wallet = await Wallet.findOneAndUpdate(

            { userId },
            {
                $inc: { balance: transaction.amount },
                $push:{transactions:transaction}
            },
            {new:true,upsert:true}
        )
        return wallet

    }



}

export default WalletRepository