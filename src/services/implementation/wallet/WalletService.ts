import { Types } from "mongoose";
import IWalletService from "../../interfaces/wallet/IWalletService";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import IWalletRepository from "../../../repositories/interfaces/wallet/IWalletRepository";




class WalletService implements IWalletService{

    private _walletRepository:IWalletRepository

    constructor(walletRepository:IWalletRepository){
        this._walletRepository = walletRepository
    }


    async creditRefund(userId: Types.ObjectId, amount: number, reason: string, relatedAppointmentId?: Types.ObjectId): Promise<void> {
        
        try {

            if(amount <= 0){
                throw new CustomError("Ivalid refund amount",StatusCode.BAD_REQUEST)
            }

            const transaction = {
                type:"credit" as const,
                amount,
                reason,
                relatedAppointmentId,
                status:"success" as const,
                createdAt: new Date()

            }

            let wallet = await this._walletRepository.findByUserId(userId);

            if(!wallet){
                wallet = await this._walletRepository.createWalletForUser(userId)
            }

            await this._walletRepository.addTransactionAndUpdateBalance(userId,transaction)
            
        } catch (error) {

            if(error instanceof CustomError){
                throw new CustomError(error.message,error.statusCode)
            }else{
                throw new CustomError("Internal server error",StatusCode.INTERNAL_SERVER_ERROR)
            }
            
        }
    }


}


export default WalletService