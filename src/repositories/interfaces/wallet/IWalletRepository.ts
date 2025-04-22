import { Types } from "mongoose"
import { IWallet, IWalletTransaction } from "../../../model/userWallet/userWalletModal"
import { PaginatedTransactionResponseDTO, WalletSummaryDTO } from "../../../types/wallet"



interface IWalletRepository{

    findByUserId(userId:Types.ObjectId):Promise<IWallet|null>

    createWalletForUser(userId:Types.ObjectId):Promise<IWallet>

    addTransactionAndUpdateBalance(
        userId:Types.ObjectId,
        transaction:IWalletTransaction
    ):Promise<IWallet>

    getWlletByUserId(userId:string):Promise<WalletSummaryDTO|null>

    getPaginatedTransactions(
        userId: string,
        page: number,
        limit: number,
        sortOrder?: "asc" | "desc"
      ): Promise<PaginatedTransactionResponseDTO>;



}


export default IWalletRepository