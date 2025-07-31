export interface SubscriptionDTO {
    _id: string;
    planName: string;
    duration: {
        value: number;
        unit: "day" | "month" | "year";
    };
    price: number;
    discount?: {
        amount: number;
        type: "percentage" | "amount";
    };
    finalPrice: number;
    serviceLimit: number;
    features: string[];
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}