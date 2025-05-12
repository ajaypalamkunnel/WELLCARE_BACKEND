import { Types } from "mongoose";
import IWalletService from "../../interfaces/wallet/IWalletService";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import IWalletRepository from "../../../repositories/interfaces/wallet/IWalletRepository";
import {
    PaginatedTransactionResponseDTO,
    WalletSummaryDTO,
} from "../../../types/wallet";

class WalletService implements IWalletService {
    private _walletRepository: IWalletRepository;

    constructor(walletRepository: IWalletRepository) {
        this._walletRepository = walletRepository;
    }

    async creditRefund(
        userId: Types.ObjectId,
        amount: number,
        reason: string,
        relatedAppointmentId?: Types.ObjectId
    ): Promise<void> {
        try {
            if (amount <= 0) {
                throw new CustomError("Ivalid refund amount", StatusCode.BAD_REQUEST);
            }

            const transaction = {
                type: "credit" as const,
                amount,
                reason,
                relatedAppointmentId,
                status: "success" as const,
                createdAt: new Date(),
            };

            let wallet = await this._walletRepository.findByUserId(userId);

            if (!wallet) {
                wallet = await this._walletRepository.createWalletForUser(userId);
            }

            await this._walletRepository.addTransactionAndUpdateBalance(
                userId,
                transaction
            );
        } catch (error) {
            if (error instanceof CustomError) {
                throw new CustomError(error.message, error.statusCode);
            } else {
                throw new CustomError(
                    "Internal server error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async getWalletSummary(userId: string): Promise<WalletSummaryDTO> {
        try {
            const wallet = await this._walletRepository.getWlletByUserId(userId);

            if (!wallet) {
                throw new CustomError(
                    "Wallet not found for this user",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }

            return {
                balance: wallet.balance,
                currency: wallet.currency,
            };
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    "Internal server error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async getWalletTransactions(
        userId: string,
        page: number,
        limit: number,
        sortOrder?: "asc" | "desc"
    ): Promise<PaginatedTransactionResponseDTO> {
        try {
            const { transactions, total } =
                await this._walletRepository.getPaginatedTransactions(
                    userId,
                    page,
                    limit,
                    sortOrder
                );

            return {
                transactions,
                total,
                page,
                limit,
            };
        } catch (error) {
            console.error("transactions featching error");

            throw new CustomError(
                "transactions fetching error",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }
}

export default WalletService;
