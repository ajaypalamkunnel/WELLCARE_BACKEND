import { Types } from "mongoose";
import DoctorWallet, { IDoctorWallet } from "../../../model/doctorWallet/doctorWallet";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorWalletRepository from "../../interfaces/doctorWallet/IDoctorWallet";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";



class DoctorWalletRepository extends BaseRepository<IDoctorWallet> implements IDoctorWalletRepository{

    constructor(){
        super(DoctorWallet)
    }
    async getWalletByDoctorId(doctorId: string): Promise<IDoctorWallet | null> {
       return await DoctorWallet.findOne({doctorId })
    }
    async createWalletIfNotExists(doctorId: string): Promise<IDoctorWallet> {
        let wallet = await DoctorWallet.findOne({doctorId})

        if(!wallet){

            wallet = new DoctorWallet({
                doctorId,
                balance: 0,
                currency: "INR",
                transactions: [],
            })
            await wallet.save()
        }

        return wallet
    }
    async addTransaction(doctorId: string, amount: number, type: "credit" | "debit", reason: string, relatedAppointmentId?: string,status?: "success" | "pending" | "failed"): Promise<void> {
        try {

           const relatedAppointmentIdObjectId = new Types.ObjectId(relatedAppointmentId)

            const wallet = await this.createWalletIfNotExists(doctorId)

            wallet.transactions.unshift({
                type,
                amount,
                reason,
                relatedAppointmentId:relatedAppointmentIdObjectId,
                status:status!,
                createdAt: new Date()
            })

            wallet.balance += type === "credit" ? amount : -amount

            await wallet.save()
            
        } catch (error) {
            throw new CustomError("Transaction processing error",StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

    
    async getWalletSummary(doctorId: string): Promise<{ totalCredited: number; totalWithdrawn: number; balance: number; }> {

        try {

             const wallet = await this.getWalletByDoctorId(doctorId);

             if(!wallet) return {totalCredited:0,totalWithdrawn:0,balance:0}

             const totalCredited = wallet.transactions
                .filter((t)=> t.type === "credit" && t.status === "success")
                .reduce((acc,t) => acc + t.amount,0)


            const totalWithdrawn = wallet.transactions
                .filter((t) => t.type === "debit" && t.status === "success")
                .reduce((acc,t)=> acc + t.amount,0)


            return {
                totalCredited,
                totalWithdrawn,
                balance:wallet.balance
            }
            

        } catch (error) {

            throw new CustomError("getting wallet summary error: ",StatusCode.INTERNAL_SERVER_ERROR)
            
        }
        
    }
    
}