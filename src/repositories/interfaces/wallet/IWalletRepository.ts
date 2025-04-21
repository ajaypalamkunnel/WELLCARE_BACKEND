import { Types } from "mongoose"
import { IWallet, IWalletTransaction } from "../../../model/userWallet/userWalletModal"
import { WalletSummaryDTO } from "../../../types/wallet"



interface IWalletRepository{

    findByUserId(userId:Types.ObjectId):Promise<IWallet|null>

    createWalletForUser(userId:Types.ObjectId):Promise<IWallet>

    addTransactionAndUpdateBalance(
        userId:Types.ObjectId,
        transaction:IWalletTransaction
    ):Promise<IWallet>

    getWlletByUserId(userId:string):Promise<WalletSummaryDTO|null>



}


export default IWalletRepository