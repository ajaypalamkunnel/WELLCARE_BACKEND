import mongoose from "mongoose";
import DoctorSchedules from "../../../model/doctorService/doctorSchedule";
import { User, IUser } from "../../../model/user/userModel";
import { IScheduleResponse } from "../../../types/bookingTypes";
import { BaseRepository } from "../../base/BaseRepository";
import IUserRepository from "../../interfaces/user/IUser";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";

class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(User)
    }
    
    

    async findUserByEmail(email: string): Promise<IUser | null> {
        // console.log("Iam from findUserByEmail==>",email);

        return await User.findOne({ email })
    }

    async updateRefreshToken(userId: string, refreshToken: string): Promise<IUser | null> {
        return await User.findByIdAndUpdate(userId, { refreshToken })
    }

    async removeRefreshToken(refreshToken: string): Promise<void> {
        await User.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } })
    }

    async findUserDataById(userId: string): Promise<IUser | null> {
        return await User.findById(userId).select("-password -refreshToken")
    }

    async updateUserStatus(userId:string,status:number):Promise<IUser|null>{

        if(![1,-1].includes(status)){
            throw new Error("Invalid status value. Use -1 for block, 1 for unblock.")
        }

        return await User.findByIdAndUpdate(userId,{status},{new:true}).select("-password -refreshToken -otp -otpExpires")

    }


    async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
       const user = await User.findByIdAndUpdate(userId,{password:hashedPassword},{new:true})
       return !!user
    }


   async updateUserDetails(email: string, updateData: Partial<IUser>): Promise<IUser | null> {
        try {

            return await User.findOneAndUpdate(
                {email},
                {...updateData,isVerified:true,updatedAt:new Date()},
                {new:true}

            )
            
        } catch (error) {
            console.error("Error updating user details");

            if (error instanceof CustomError) {
                throw error;
              }


            throw new Error("Database error while fetching user details")
            
        }
    }



    async fetchDoctorDaySchedule(doctorId: string, date: Date): Promise<IScheduleResponse[]> {

        try {

            const today = new Date();
            today.setUTCHours(0,0,0,0);

            const inputDate = new Date(date);
            inputDate.setUTCHours(0, 0, 0, 0);


            if (inputDate < today) {
                throw new CustomError(
                  "Fetching past date schedules is not allowed.",
                  StatusCode.BAD_REQUEST
                );
              }


            const startOfDay = new Date(date)
            startOfDay.setUTCHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999)



            const schedules = await DoctorSchedules.aggregate<IScheduleResponse>([
                {
                    $match: {
                        doctorId: new mongoose.Types.ObjectId(doctorId),
                        date: {
                            $gte: startOfDay,
                            $lte: endOfDay
                        },
                    },
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service"
                    }

                },
                {
                    $unwind: "$service"

                },
                {
                    $project: {
                        _id: 1,
                        doctorId: 1,
                        date: 1,
                        start_time: 1,
                        end_time: 1,
                        duration: 1,
                        availability: 1,
                        serviceId: {
                            _id: "$service._id",
                            name: "$service.name",
                            fee: "$service.fee",
                            mode: "$service.mode",
                        }
                    }
                }, {
                    $sort: {
                        start_time: 1
                    }
                }

            ])

            return schedules

        } catch (error) {
            console.error("fetchDoctorDaySchedule Repository Error:", error);

            if (error instanceof CustomError) {
                throw error;
              }
            throw new CustomError("Failed to fetch doctor schedules.", StatusCode.INTERNAL_SERVER_ERROR)
        }

    }


    
    


    

    

    

}

export default UserRepository


// export async function fetchDoctorDaySchedule(
//     doctorId: string,
//     date: Date
//   ): Promise<IScheduleResponse[]> {
//     try {
//       const startOfDay = new Date(date);
//       startOfDay.setUTCHours(0, 0, 0, 0);
  
//       const endOfDay = new Date(date);
//       endOfDay.setUTCHours(23, 59, 59, 999);
  
//       const schedules = await DoctorSchedules.aggregate<IScheduleResponse>([
//         {
//           $match: {
//             doctorId: new mongoose.Types.ObjectId(doctorId),
//             date: { $gte: startOfDay, $lte: endOfDay },
//           },
//         },
//         {
//           $lookup: {
//             from: "services", // Must match your MongoDB collection name exactly
//             localField: "serviceId",
//             foreignField: "_id",
//             as: "service",
//           },
//         },
//         {
//           $unwind: "$service", // Flatten the service array
//         },
//         {
//           $project: {
//             _id: 1,
//             doctorId: 1,
//             date: 1,
//             start_time: 1,
//             end_time: 1,
//             duration: 1,
//             availability: 1,
//             serviceId: {
//               _id: "$service._id",
//               name: "$service.name",
//               fee: "$service.fee",
//               mode: "$service.mode",
//             },
//           },
//         },
//         {
//           $sort: { start_time: 1 },
//         },
//       ]);
  
//       return schedules;
//     } catch (error) {
//       console.error("fetchDoctorDaySchedule Repository Error:", error);
//       throw new CustomError(
//         "Failed to fetch doctor schedules.",
//         StatusCode.INTERNAL_SERVER_ERROR
//       );
//     }
//   }