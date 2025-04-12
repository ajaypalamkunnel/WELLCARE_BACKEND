import { Types } from "mongoose";


interface IWalletService{

    creditRefund(
        userId: Types.ObjectId,
        amount: number,
        reason: string,
        relatedAppointmentId?: Types.ObjectId
      ): Promise<void>;

}

export default IWalletService