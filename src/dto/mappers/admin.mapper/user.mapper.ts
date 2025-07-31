import { IUser } from "../../../model/user/userModel";
import { UserDTO } from "../../adminDto/User.dto";

export const mapUserToDTO = (user: IUser): UserDTO => {
    const defaultPersonalInfo = {
        age: 0,
        gender: "male",
        blood_group: "",
        allergies: "",
        chronic_disease: ""
    };

    return {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        profileUrl: user.profileUrl ?? null,
        status: user.status,
        isVerified: user.isVerified,
        personalInfo: user.personalInfo ?? defaultPersonalInfo,
        address: user.address ?? {
            houseName: "",
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: ""
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};
