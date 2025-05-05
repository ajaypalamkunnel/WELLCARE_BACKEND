// src/dtos/wallet/WalletSummaryDTO.ts

export interface WalletSummaryDTO {
    balance: number;
    currency: string;
  }
  

// src/dtos/wallet/WalletTransactionDTO.ts

export interface WalletTransactionDTO {
  type: "credit" | "debit";
  amount: number;
  reason: string;
  status: "success" | "failed" | "pending";
  relatedAppointmentId?: string;
  createdAt: Date;
}


export interface PaginatedTransactionResponseDTO {
  transactions: WalletTransactionDTO[];
  total: number;
  page: number;
  limit: number;
}



export interface DoctorWalletSummaryDTO {
  totalCredited: number;
  totalWithdrawn: number;
  balance: number;
  withdrawable: number;
  transactions: {
    type: "credit" | "debit";
    amount: number;
    reason: string;
    relatedAppointmentId?: string;
    status: "success" | "pending" | "failed";
    createdAt: Date;
  }[];
  totalTransactions: number;
}