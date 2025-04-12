import { Types } from "mongoose"
import { IWallet, IWalletTransaction } from "../../../model/userWallet/userWalletModal"



interface IWalletRepository{

    findByUserId(userId:Types.ObjectId):Promise<IWallet|null>

    createWalletForUser(userId:Types.ObjectId):Promise<IWallet>

    addTransactionAndUpdateBalance(
        userId:Types.ObjectId,
        transaction:IWalletTransaction
    ):Promise<IWallet>

}


export default IWalletRepository