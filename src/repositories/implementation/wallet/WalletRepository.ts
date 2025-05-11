import mongoose, { mongo, Types } from "mongoose";
import Wallet, {
    IWallet,
    IWalletTransaction,
} from "../../../model/userWallet/userWalletModal";
import { BaseRepository } from "../../base/BaseRepository";
import IWalletRepository from "../../interfaces/wallet/IWalletRepository";
import {
    PaginatedTransactionResponseDTO,
    WalletSummaryDTO,
} from "../../../types/wallet";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";

/**
 * WalletRepository is responsible for managing wallet-related operations
 * such as creating wallets, fetching wallet details, adding transactions,
 * and updating wallet balances. It extends the BaseRepository and implements
 * the IWalletRepository interface.
 */
class WalletRepository
    extends BaseRepository<IWallet>
    implements IWalletRepository {
    constructor() {
        super(Wallet);
    }

    // Find wallet by user ID
    async findByUserId(userId: Types.ObjectId): Promise<IWallet | null> {
        return await Wallet.findOne({ userId });
    }

    // Create a wallet for a user
    async createWalletForUser(userId: Types.ObjectId): Promise<IWallet> {
        return await Wallet.create({
            userId,
            balance: 0,
            transactions: [],
        });
    }

    // Add a transaction and update wallet balance
    async addTransactionAndUpdateBalance(
        userId: Types.ObjectId,
        transaction: IWalletTransaction
    ): Promise<IWallet> {
        const wallet = await Wallet.findOneAndUpdate(
            { userId },
            {
                $inc: { balance: transaction.amount },
                $push: { transactions: transaction },
            },
            { new: true, upsert: true }
        );
        return wallet;
    }

    // Get wallet summary by user ID
    async getWlletByUserId(userId: string): Promise<WalletSummaryDTO | null> {
        try {
            const wallet = await Wallet.findOne({
                userId: new mongoose.Types.ObjectId(userId),
            }).select("balance currency");
            return wallet;
        } catch (error) {
            throw new CustomError(
                "Failed to fetch wallet for user",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Get paginated wallet transactions
    async getPaginatedTransactions(
        userId: string,
        page: number,
        limit: number,
        sortOrder?: "asc" | "desc"
    ): Promise<PaginatedTransactionResponseDTO> {
        try {
            const skip = (page - 1) * limit;

            const result = await Wallet.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                { $unwind: "$transactions" },
                {
                    $sort: {
                        "transactions.createdAt": sortOrder === "asc" ? 1 : -1,
                    },
                },

                {
                    $facet: {
                        paginatedTransactions: [
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 0,
                                    type: "$transactions.type",
                                    amount: "$transactions.amount",
                                    reason: "$transactions.reason",
                                    status: "$transactions.status",
                                    createdAt: "$transactions.createdAt",
                                    relatedAppointmentId: "$transactions.relatedAppointmentId",
                                },
                            },
                        ],
                        totalCount: [{ $count: "total" }],
                    },
                },
            ]);

            const transactions = result[0]?.paginatedTransactions || [];
            const total = result[0]?.totalCount[0]?.total || 0;

            return { transactions, total, page, limit };
        } catch (error) {
            console.error("Error fetching wallet transactions:", error);
            throw new CustomError(
                "Failed to fetch wallet transactions",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    // Add a transaction to the wallet
    async addTransaction({
        userId,
        amount,
        type,
        reason,
        relatedAppointmentId,
        status,
    }: {
        userId: string;
        amount: number;
        type: "credit" | "debit";
        reason: string;
        relatedAppointmentId?: string;
        status: "success";
    }): Promise<void> {
        try {
            let wallet = await Wallet.findOne({ userId });

            const relatedAppointmentIdObjectId = new Types.ObjectId(
                relatedAppointmentId
            );

            if (!wallet) {
                wallet = new Wallet({
                    userId,
                    balance: 0,
                    currency: "INR",
                    transactions: [],
                });
            }

            wallet.transactions.unshift({
                type,
                amount,
                reason,
                relatedAppointmentId: relatedAppointmentIdObjectId,
                status,
                createdAt: new Date(),
            });

            wallet.balance += type === "credit" ? amount : -amount;

            await wallet.save();
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            } else {
                throw new CustomError(
                    "wallet updating error",
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}

export default WalletRepository;
