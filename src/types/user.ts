

interface IPersonalInfo {
    age: number;
    gender: string;
    blood_group: string;
}


interface IUserType  {
    _id: string;
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    status: number;
    isVerified: boolean;
    otp?: string | null;
    otpExpires?: Date | null;
    updatedAt?: Date;
    createdAt?: Date;
    personalInfo: IPersonalInfo;
    refreshToken: string 
    accessToken:string

}

export {IUserType}