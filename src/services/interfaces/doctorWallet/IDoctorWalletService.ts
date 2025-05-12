import { DoctorWalletSummaryDTO } from "../../../types/wallet";

interface IDoctorWalletService {
  getWalletData(
    doctorId: string,
    type?: "credit" | "debit",
    page?: number,
    limit?: number
  ): Promise<DoctorWalletSummaryDTO>;

  withdraw(doctorId: string, amount: number): Promise<void>;
}

export default IDoctorWalletService;
