import { StatusCode } from "../../../constants/statusCode";
import IDoctorWalletRepository from "../../../repositories/interfaces/doctorWallet/IDoctorWallet";
import { DoctorWalletSummaryDTO } from "../../../types/wallet";
import { CustomError } from "../../../utils/CustomError";
import IDoctorWalletService from "../../interfaces/doctorWallet/IDoctorWalletService";



class DoctorWalletService implements IDoctorWalletService {

    private _doctorWalletRepo: IDoctorWalletRepository

    constructor(doctorWalletRepo: IDoctorWalletRepository) {
        this._doctorWalletRepo = doctorWalletRepo
    }



    async getWalletData(doctorId: string, type?: "credit" | "debit", page = 1, limit = 10): Promise<DoctorWalletSummaryDTO> {
        try {

            const walletSummary = await this._doctorWalletRepo.getWalletOverview(doctorId, type, page, limit)

            if (!walletSummary) {
                throw new CustomError("wallet summary fetching error", StatusCode.BAD_REQUEST)
            }

            return walletSummary

        } catch (error) {


            if (error instanceof CustomError) {
                throw error
            } else {

                throw new CustomError("Internal server error", StatusCode.INTERNAL_SERVER_ERROR)
            }

        }
    }

    async withdraw(doctorId: string, amount: number): Promise<void> {
        try {
            if (!doctorId || !amount || isNaN(amount)) {
                throw new CustomError("Invalid doctorId or amount", StatusCode.BAD_REQUEST);
            }

            if (amount <= 0) {
                throw new CustomError("Withdrawal amount must be greater than zero", StatusCode.BAD_REQUEST);
            }

            const wallet = await this._doctorWalletRepo.getWalletByDoctorId(doctorId);
            if (!wallet) {
                throw new CustomError("Wallet not found", StatusCode.NOT_FOUND);
            }

            if (wallet.balance < amount) {
                throw new CustomError("Insufficient wallet balance", StatusCode.BAD_REQUEST);
            }

            // Record the debit transaction (withdrawal request)
            await this._doctorWalletRepo.addTransaction(
                doctorId,
                amount,
                "debit",
                "Withdrawal request",
                undefined, // no appointment associated
                "success"  // default to pending, can be set to 'success' if auto-processed
            );

        } catch (error: any) {
            if (error instanceof CustomError) {
                throw error;
            }

            console.error("Withdraw error:", error);
            throw new CustomError("Failed to process withdrawal", StatusCode.INTERNAL_SERVER_ERROR);
        }
    }



}


export default DoctorWalletService