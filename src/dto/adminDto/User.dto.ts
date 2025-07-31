import { IAddress } from "../../model/user/userModel";

export interface UserDTO {
    _id: string;
    fullName: string;
    email: string;
    mobile: string;
    profileUrl?: string | null;
    status: number;
    isVerified: boolean;
    personalInfo: {
        age: number;
        gender: "male" | "female";
        blood_group: string;
        allergies: string;
        chronic_disease: string;
    };
    address: IAddress;
    createdAt?: Date;
    updatedAt?: Date;
}
