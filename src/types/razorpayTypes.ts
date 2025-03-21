export interface RazorpayOrderResponse {
    success: boolean;
    message: string;
    data: {
      orderId: string;
      amount: number;
      currency: string;
      key: string;
      plan: {
        _id: string;
        planName: string;
        finalPrice: number;
        duration: { value: number; unit: string };
        serviceLimit: number;
      };
    };
  }
  