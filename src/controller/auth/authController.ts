// import { Request, Response } from "express";
// import UserService from "../../services/implementation/user/userService";
// import DoctorService from "../../services/implementation/doctor/doctorService";
// import UserRepository from "../../repositories/implementation/user/userRepository";
// import DoctorRepository from "../../repositories/implementation/doctor/doctorRepository";
// import { IUser } from "../../types/authTypes";

// const userRepository = new UserRepository()
// const userService = new UserService(userRepository)
// const doctorRepository = new DoctorRepository()
// const doctorService = new DoctorService(doctorRepository)

// class AuthController{


//     static async fetchTokens(req: Request, res: Response): Promise<void> {
//         try {

//             const user = req.user as IUser;

//             if(!user){
//                 res.status(401).json({ error: "Unauthorized: No user found in session." });  
//             }
//             console.log("Generating accessToken for:", user.email, "name:",user.fullName );

//             const { accessToken } = user.role === "patient"
//             ? await doctorService.generateTokens(user)
//             : await userService.generateTokens(user);
            
//         } catch (error) {
            
//         }
//     }
// }