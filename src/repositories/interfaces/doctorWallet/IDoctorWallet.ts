import { IDoctorWallet, IDoctorWalletTransaction } from "../../../model/doctorWallet/doctorWallet";
import { DoctorWalletSummaryDTO } from "../../../types/wallet";


interface IDoctorWalletRepository{

    getWalletByDoctorId(doctorId: string): Promise<IDoctorWallet | null>;

    createWalletIfNotExists(doctorId: string): Promise<IDoctorWallet>;

    addTransaction(
        doctorId: string,
        amount: number,
        type: "credit" | "debit",
        reason: string,
        relatedAppointmentId?: string,
        status?: "success" | "pending" | "failed"
      ): Promise<void>;


      getWalletSummary(doctorId: string): Promise<{
        totalCredited: number;
        totalWithdrawn: number;
        balance: number;
      }>;


      getWalletOverview(
        doctorId: string,
        type?: "credit" | "debit",
        page?:number,
        limit?:number,
      ): Promise<DoctorWalletSummaryDTO>



      requestWithdrawal(
        doctorId: string,
        amount: number
      ): Promise<void> 




}


export default IDoctorWalletRepository