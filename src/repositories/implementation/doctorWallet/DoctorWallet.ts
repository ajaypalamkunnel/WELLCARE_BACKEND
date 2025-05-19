import { Types } from "mongoose";
import DoctorWallet, {
    IDoctorWallet,
} from "../../../model/doctorWallet/doctorWallet";
import { BaseRepository } from "../../base/BaseRepository";
import IDoctorWalletRepository from "../../interfaces/doctorWallet/IDoctorWallet";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import { DoctorWalletSummaryDTO } from "../../../types/wallet";

class DoctorWalletRepository
    extends BaseRepository<IDoctorWallet>
    implements IDoctorWalletRepository {
    constructor() {
        super(DoctorWallet);
    }

    async getWalletByDoctorId(doctorId: string): Promise<IDoctorWallet | null> {
        return await DoctorWallet.findOne({ doctorId });
    }
    async createWalletIfNotExists(doctorId: string): Promise<IDoctorWallet> {
        let wallet = await DoctorWallet.findOne({ doctorId });

        if (!wallet) {
            wallet = new DoctorWallet({
                doctorId,
                balance: 0,
                currency: "INR",
                transactions: [],
            });
            await wallet.save();
        }

        return wallet;
    }
    async addTransaction(
        doctorId: string,
        amount: number,
        type: "credit" | "debit",
        reason: string,
        relatedAppointmentId?: string,
        status?: "success" | "pending" | "failed"
    ): Promise<void> {
        try {
            const relatedAppointmentIdObjectId = new Types.ObjectId(
                relatedAppointmentId
            );

            const wallet = await this.createWalletIfNotExists(doctorId);

            wallet.transactions.unshift({
                type,
                amount,
                reason,
                relatedAppointmentId: relatedAppointmentIdObjectId,
                status: status!,
                createdAt: new Date(),
            });

            wallet.balance += type === "credit" ? amount : -amount;

            await wallet.save();
        } catch (error) {
            if(error instanceof CustomError){
                throw error
            }else{
                throw new CustomError(
                    "Transaction processing error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );

            }
        }
    }

    async getWalletSummary(
        doctorId: string
    ): Promise<{
        totalCredited: number;
        totalWithdrawn: number;
        balance: number;
    }> {
        try {
            const wallet = await this.getWalletByDoctorId(doctorId);

            if (!wallet) return { totalCredited: 0, totalWithdrawn: 0, balance: 0 };

            const totalCredited = wallet.transactions
                .filter((t) => t.type === "credit" && t.status === "success")
                .reduce((acc, t) => acc + t.amount, 0);

            const totalWithdrawn = wallet.transactions
                .filter((t) => t.type === "debit" && t.status === "success")
                .reduce((acc, t) => acc + t.amount, 0);

            return {
                totalCredited,
                totalWithdrawn,
                balance: wallet.balance,
            };
        } catch (error) {
            if(error instanceof CustomError){
                throw error
            }else{
                throw new CustomError(
                    "getting wallet summary error: ",
                    StatusCode.INTERNAL_SERVER_ERROR
                );

            }
        }
    }

    async getWalletOverview(
        doctorId: string,
        type?: "credit" | "debit",
        page = 1,
        limit = 10
    ): Promise<DoctorWalletSummaryDTO> {
        try {
            const wallet = await this.getWalletByDoctorId(doctorId);

            if (!wallet) {
                return {
                    totalCredited: 0,
                    totalWithdrawn: 0,
                    balance: 0,
                    withdrawable: 0,
                    transactions: [],
                    totalTransactions: 0,
                };
            }

            const allTx = wallet.transactions;

            const totalCredited = allTx
                .filter((t) => t.type === "credit" && t.status === "success")
                .reduce((sum, tx) => sum + tx.amount, 0);

            const totalWithdrawn = allTx
                .filter((t) => t.type === "debit" && t.status === "success")
                .reduce((sum, tx) => sum + tx.amount, 0);

            const filteredTx = type ? allTx.filter((t) => t.type === type) : allTx;

            const paginatedTx = filteredTx
                .slice((page - 1) * limit, page * limit)
                .map((t): DoctorWalletSummaryDTO["transactions"][0] => ({
                    type: t.type,
                    amount: t.amount,
                    reason: t.reason,
                    relatedAppointmentId: t.relatedAppointmentId?.toString(),
                    status: t.status,
                    createdAt: t.createdAt,
                }));

            return {
                totalCredited,
                totalWithdrawn,
                balance: wallet.balance,
                withdrawable: wallet.balance,
                transactions: paginatedTx,
                totalTransactions: filteredTx.length,
            };
        } catch (error) {
            if(error instanceof CustomError){
                throw error
            }else{
                throw new CustomError(
                    "Failed to fetch wallet overview",
                    StatusCode.INTERNAL_SERVER_ERROR
                );

            }
        }
    }

    async requestWithdrawal(doctorId: string, amount: number): Promise<void> {
        try {
            const wallet = await this.getWalletByDoctorId(doctorId);

            if (!wallet) {
                throw new CustomError("Wallet not found", StatusCode.NOT_FOUND);
            }

            if (amount <= 0 || amount > wallet.balance) {
                throw new CustomError(
                    "Invalid withdrawal amount",
                    StatusCode.BAD_REQUEST
                );
            }

            wallet.transactions.unshift({
                type: "debit",
                amount,
                reason: "Manual withdrawal",
                status: "success",
                createdAt: new Date(),
            });

            wallet.balance -= amount;

            await wallet.save();
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    "withdrawal error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}

export default DoctorWalletRepository;
