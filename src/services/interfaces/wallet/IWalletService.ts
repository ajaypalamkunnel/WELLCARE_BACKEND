import { Types } from "mongoose";
import { PaginatedTransactionResponseDTO, WalletSummaryDTO } from "../../../types/wallet";


interface IWalletService{

    creditRefund(
        userId: Types.ObjectId,
        amount: number,
        reason: string,
        relatedAppointmentId?: Types.ObjectId
      ): Promise<void>;

    getWalletSummary(userId:string):Promise<WalletSummaryDTO>

    getWalletTransactions(
      userId: string,
      page: number,
      limit: number,
      sortOrder?: "asc" | "desc"
    ): Promise<PaginatedTransactionResponseDTO>;

}

export default IWalletService