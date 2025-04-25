import { IDoctorWallet } from "../../../model/doctorWallet/doctorWallet";


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




}


export default IDoctorWalletRepository