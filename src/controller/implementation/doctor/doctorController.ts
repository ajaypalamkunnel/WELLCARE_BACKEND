import e, { Request, Response } from "express";
import IDoctorController from "../../interfaces/doctor/IDoctorController";
import { IDoctorService } from "../../../services/interfaces/doctor/iDoctorServices";
import { error } from "console";
import { ERROR_MESSAGES, StatusCode } from "../../../constants/statusCode";
import { handleErrorResponse } from "../../../utils/errorHandler";
import { CustomError } from "../../../utils/CustomError";
import { generateErrorResponse, generateSuccessResponse } from "../../../utils/response";
import { ChatUser } from "../../../types/chat";
import DoctorService from "../../../services/implementation/doctor/doctorService";
import { json } from "body-parser";
import IDoctorWalletService from "../../../services/interfaces/doctorWallet/IDoctorWalletService";
import { Types } from "mongoose";


class DoctorController implements IDoctorController {

    private _doctorService: IDoctorService
    private _walletService: IDoctorWalletService

    constructor(_doctorService: IDoctorService, walletService: IDoctorWalletService) {
        this._doctorService = _doctorService
        this._walletService = walletService
    }
    




    //------------------ Docotor basic registration at signup-----------------------------

    async registerBasicDetails(req: Request, res: Response): Promise<void> {
        try {

            const { doctor } = await this._doctorService.registerBasicDetails(req.body)

            res.status(StatusCode.CREATED).json({ message: "OTP sent to email", email: doctor.email })

        } catch (error) {
            let errorMessage = "an unexpected error occured";

            if (error instanceof Error) {
                errorMessage = error.message
            }
            res.status(StatusCode.BAD_REQUEST).json({ error: errorMessage })
        }
    }


    async resendOtp(req: Request, res: Response): Promise<Response> {
        try {
            const { email } = req.body

            if (!email) {
                return res.status(StatusCode.BAD_REQUEST).json({ success: true, error: "Email is required" })
            }
            await this._doctorService.resendOtp(email)
            return res.status(StatusCode.OK).json({ success: true, message: "New OTP sent to email" })
        } catch (error) {
            return res.status(StatusCode.BAD_REQUEST).json({ success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" })
        }
    }
    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body

            if (!email || !otp) {
                res.status(StatusCode.BAD_REQUEST).json({ error: "Email and OTP are required" })
                return
            }
            await this._doctorService.verifyOtp(email, otp)
            res.status(StatusCode.OK).json({ message: "OTP verified successfully, Your account is now activated." })
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ error: error instanceof Error ? error.message : "OTP verification failed" })
        }
    }


    async postLogin(req: Request, res: Response): Promise<void> {

        try {
            const { email, password } = req.body
           
            if (!email || !password) {
                res.status(StatusCode.BAD_REQUEST).json({ error: "Email and password are required" })
                return
            }

            const { doctorAccessToken, doctorRefreshToken, doctor } = await this._doctorService.loginDoctor(email, password)
           

            res.cookie("doctorRefreshToken", doctorRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 100
            })


            res.cookie("doctorAccessToken", doctorAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
            });
            

            res.status(StatusCode.OK).json({
                success: true,
                message: "Login successful",
                doctorAccessToken,
                doctor: { id: doctor?._id, email: doctor?.email, fullName: doctor?.fullName, isVerified: doctor?.isVerified, isSubscribed: doctor?.isSubscribed, subscriptionExpiryDate: doctor?.subscriptionExpiryDate }
            })
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ error: error instanceof Error ? error.message : "Login failed" })
        }
    }


    async forgotPasswordDoctor(req: Request, res: Response): Promise<void> {

        try {
            const { email } = req.body
            

            if (!email) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, error: "Email is required" })
                return
            }

            await this._doctorService.forgotPassword(email)
            res.status(StatusCode.OK).json({ success: true, message: "New OTP sent to email" })

        } catch (error) {
            console.error("Error in forgotPassword controller:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error instanceof Error ? error.message : "An unexpected error occurred"
            });


        }
    }
    async updatePasswordDoctor(req: Request, res: Response): Promise<void> {
        try {

            const { email, password } = req.body

            if (!email) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, error: "Email is required" })
            }

            await this._doctorService.updatePasswordDoctor(email, password)
            res.status(StatusCode.OK).json({ success: true, error: "Password Updated Successfully" })
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" })
        }
    }


    renewAuthTokens(req: Request, res: Response): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async googleAuthCallback(req: Request, res: Response): Promise<void> {
        try {

            const doctor = req.user;
            if (!doctor) {
                res.redirect(`${process.env.FRONTEND_URL}/login?error=AuthenticationFailed`);
                return;
            }
            const { accessToken, refreshToken } = await this._doctorService.generateTokens(doctor)

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            

            res.redirect(`${process.env.FRONTEND_URL}/auth-success?role=doctor`);

        } catch (error) {
            res.redirect(`${process.env.FRONTEND_URL}/login?error=InternalServerError`);
        }
    }



    async logoutDoctor(req: Request, res: Response): Promise<void> {
        try {

            const refreshToken = req.cookies.doctorRefreshToken


            if (!refreshToken) {
                res.status(StatusCode.BAD_REQUEST).json({ error: "No refersh token provided" })
                return
            }

            await this._doctorService.logoutDoctor(refreshToken)


            res.clearCookie("doctorRefreshToken", {
                httpOnly: true,
                secure: process.env.NODE === "production",
                sameSite: true
            })

            res.cookie("doctorAccessToken", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                expires: new Date(0), // Expire the cookie immediately
            });


            res.status(StatusCode.OK).json({ success: true, message: "Logout successfull" })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Logout failed" })
        }

    }

    async getProfile(req: Request, res: Response): Promise<void> {


        try {
            if (!req.user) {
                res.status(StatusCode.UNAUTHORIZED).json({ error: "Unauthorized" })
                return
            }


            const user = await this._doctorService.getDoctorProfile(req.user.userId);
            if (!user) {
                res.status(404).json({ error: "User not found" })

            }


            res.status(StatusCode.OK).json({ success: true, user })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Failed to fetch user profile" });
        }
    }



    async registerDoctor(req: Request, res: Response): Promise<void> {
        try {
            const { fullName, email,
                mobile, departmentId, gender,
                specialization, experience,
                licenseNumber, availability,
                clinicAddress, profileImage,
                licenseDocument, IDProofDocument,
                education, certifications } = req.body;




            if (!fullName || !email || !mobile || !departmentId || !experience || !licenseNumber || !availability || !profileImage || !licenseDocument || !IDProofDocument || !education || !certifications) {
                res.status(StatusCode.BAD_REQUEST).json({ error: "All required fields must be provided" });
                return
            }

            const { doctor } = await this._doctorService.registerDoctor(req.body)

            res.status(StatusCode.CREATED).json({ success: true, message: "Doctor registered successfully Your Application will verified by Administrative team", doctor })

        } catch (error) {
            handleErrorResponse(res, error)

        }
    }


    async updateDoctorStatus(req: Request, res: Response): Promise<void> {

        
        try {
            const { doctorId, status } = req.body

           


            if (!doctorId || (status !== 1 && status !== -1)) {

                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid request. Provide doctorId and valid status (-1 for block, 1 for unblock)."

                })
                return
            }

            const doctor = await this._doctorService.updateDoctorStatus(doctorId, status)

            res.status(StatusCode.OK).json({
                success: true,
                message: `Doctor ${status === -1 ? "blocked" : "unblocked"} successfully.`,
                data: doctor
            })
        } catch (error) {
            console.error(`Controller Error: ${error instanceof Error ? error.message : error}`);

            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error instanceof Error ? error.message : "An unexpected error occurred"
            })

        }
    }


    async verifyDoctor(req: Request, res: Response): Promise<void> {
        try {

            const { doctorId, isVerified, reason } = req.body

            if (!doctorId || typeof isVerified !== 'boolean') {

                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid request. Provide doctorId and isVerified as boolean.",
                })
                return
            }

            const doctor = await this._doctorService.verifyDoctor(doctorId, isVerified, reason)

            res.status(StatusCode.OK).json({
                success: true,
                message: `Doctor application has been ${isVerified ? "accepted" : "rejected"} successfully.`,
                data: doctor
            })

        } catch (error) {
            console.error(`Controller Error: ${error instanceof Error ? error.message : error}`);

            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error instanceof Error ? error.message : "An unexpected error occurred",
            })
        }
    }



    async updateProfile(req: Request, res: Response): Promise<void> {
        try {

            const { doctorId, updateData } = req.body



            if (!doctorId) {
                res.status(StatusCode.UNAUTHORIZED).json({ error: "Unauthorized access." });
                return
            }

            const updatedDoctor = await this._doctorService.updateDoctorProfile(doctorId, updateData)

            res.status(StatusCode.OK).json({
                success: true,
                message: "Profile updated successfully.",
                data: updatedDoctor,
            })

        } catch (error) {

            console.error("Error updating doctor profile:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                error: "Failed to update profile.",
                details: error instanceof Error ? error.message : "Unknown error occurred",
            });

        }
    }


    async changePassword(req: Request, res: Response): Promise<Response> {
        try {
            const { doctorId, oldPassword, newPassword } = req.body;
           


            if (!doctorId || !oldPassword || !newPassword) {
                throw new CustomError("All fields are required", 400)
            }

            const result = await this._doctorService.changePassword(doctorId, oldPassword, newPassword)

            return res.status(200).json(generateSuccessResponse(result.message))
        } catch (error: unknown) {
            const errMessage = (error as Error).message || "Something went wrong";

            console.error(`Password change error: ${errMessage}`);

            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(generateErrorResponse(errMessage));

        }
    }


    async getDoctors(req: Request, res: Response): Promise<Response> {
        try {

            const { search, departmentId, minExperience, maxExperience, gender, availability, sortBy, page, limit } =
                req.query;

            const doctors = await this._doctorService.getFilteredDoctors(
                search as string,
                departmentId as string,
                { min: minExperience ? Number(minExperience) : undefined, max: maxExperience ? Number(maxExperience) : undefined },
                gender as string,
                availability as string,
                sortBy as string,
                page ? Number(page) : 1,
                limit ? Number(limit) : 10
            );


            return res.status(StatusCode.OK).json(doctors)

        } catch (error) {
            console.error("Error fetching doctors:", error);
            return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
        }
    }

    async getDoctorProfile(req: Request, res: Response): Promise<Response> {
        try {

            const { doctorId } = req.params




            if (!doctorId) {
                return res.status(StatusCode.BAD_REQUEST).json({ message: "Doctor ID is required" })
            }

            const doctor = await this._doctorService.detailedDoctorProfile(doctorId)

            return res.status(StatusCode.OK).json(doctor)



        } catch (error: unknown) {

            console.error("Error fetching doctor profile:", error);
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({ message: error.message });
            }

            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }

            return res.status(500).json({ message: "Internal Server Error" });

        }
    }


    async getDoctorInfoForChat(req: Request, res: Response): Promise<Response> {
        try {



            const { doctorId } = req.params;

            

            if (!doctorId) {
                throw new CustomError("Doctor ID is required", StatusCode.BAD_REQUEST);
            }

            const doctor = await this._doctorService.getDoctorChatInfo(doctorId);
            

            const formatted: ChatUser = {
                _id: doctor._id.toString(),
                fullName: doctor.fullName,
                profileImage: doctor?.profileImage,
                lastMessage: "",
                lastMessageTime: "",
                unreadCount: 0,
                isOnline: false
            };


            return res.status(200).json(generateSuccessResponse("Doctor info fetched", formatted));


        } catch (error) {
            console.error(" Error fetching doctor info:", error);
            return res
                .status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
                .json(
                    generateErrorResponse(
                        error instanceof CustomError ? error.message : "Internal Server Error"
                    )
                );

        }
    }



    async addEducation(req: Request, res: Response): Promise<Response> {
        try {

            const doctorId = req.user?.userId

            const { degree, institution, yearOfCompletion } = req.body;


            if (!doctorId || !degree || !institution || !yearOfCompletion) {
                throw new CustomError("All fields are required", StatusCode.BAD_REQUEST);
            }

            const educationList = await this._doctorService.addEducation(doctorId, {
                degree,
                institution,
                yearOfCompletion,
            })

            return res.status(StatusCode.CREATED)
                .json(generateSuccessResponse("Education added successfully", educationList))

        } catch (error) {

            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
                .json(generateErrorResponse(error instanceof CustomError ? error.message : "Internal Server Error"))

        }
    }


    async addCertification(req: Request, res: Response): Promise<Response> {
        try {

            const doctorId = req.user?.userId

            const { name, issuedBy, yearOfIssue } = req.body

            if (!doctorId || !name || !issuedBy || !yearOfIssue) {
                throw new CustomError("All fields are required", StatusCode.BAD_REQUEST)
            }

            const certificateAdded = await this._doctorService.addCertification(doctorId, {
                name,
                issuedBy,
                yearOfIssue
            })

            if (!certificateAdded) {
                throw new CustomError("Failed to add certificate", StatusCode.BAD_REQUEST)
            }

            return res.status(StatusCode.ACCEPTED).json(generateSuccessResponse("Certificate added successfully", certificateAdded))

        } catch (error) {

            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
                .json(generateErrorResponse(error instanceof CustomError ? error.message : "Internal server error"))



        }
    }


    async editEducation(req: Request, res: Response): Promise<Response> {

        try {

            const doctorId = req.user?.userId;

            


            if (!doctorId) {
                throw new CustomError("doctor id is required", StatusCode.BAD_REQUEST)
            }


            const result = await this._doctorService.updateEducation(doctorId, req.body)

            if (!result) {
                throw new CustomError("education updation failed", StatusCode.BAD_REQUEST)

            }

            return res.status(StatusCode.OK)
                .json(generateSuccessResponse(error instanceof CustomError ? error.message : "Internal server error"))


        } catch (error) {

            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
                .json(generateErrorResponse(error instanceof CustomError ? error.message : "Internal server error"))

        }

    }


    async editCertification(req: Request, res: Response): Promise<Response> {
        try {

            const doctorId = req.user?.userId

            if (!doctorId) {
                throw new CustomError("unauthorized user", StatusCode.BAD_REQUEST)
            }

            const result = this._doctorService.updateCertification(doctorId, req.body)

            if (!result) {
                throw new CustomError("certification updation failed", StatusCode.BAD_REQUEST)
            }

            return res.status(StatusCode.ACCEPTED)
                .json(generateSuccessResponse("certification updated succesfully", result))

        } catch (error) {

            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
                .json(generateErrorResponse(error instanceof CustomError ? error.message : "Internal server error"))

        }
    }




    async getWalletSummary(req: Request, res: Response): Promise<Response> {
        try {

            const doctorId = req.user?.userId

            const { type, page = "1", limit = "10" } = req.query;

            if (!doctorId) {
                throw new CustomError("Invalid request", StatusCode.FORBIDDEN)
            }

            const result = await this._walletService.getWalletData(
                doctorId,
                type as "credit" | "debit" | undefined,
                parseInt(page as string),
                parseInt(limit as string)
            )

            return res.status(StatusCode.OK)
                .json(generateSuccessResponse("Wallat data fetched succesully", result))

        } catch (error) {

            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
                .json(error instanceof CustomError ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR)

        }
    }
    async witdraw(req: Request, res: Response): Promise<Response> {
        try {

            const doctorId = req.user?.userId
            const { amount } = req.body

            if (!doctorId) {
                throw new CustomError("Invalid request", StatusCode.FORBIDDEN)
            }


            if (!amount || typeof amount !== "number") {
                throw new CustomError("Invalid amount", StatusCode.BAD_REQUEST);
            }

            await this._walletService.withdraw(doctorId, amount)

            return res.status(StatusCode.OK)
                .json(generateSuccessResponse("Amount withdraw successfully"))


        } catch (error) {

            return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
                .json(error instanceof CustomError ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR)

        }
    }


    async listNotifications(req: Request, res: Response): Promise<Response> {
       try {

            const userId = req.user?.userId

           

            if(!userId){
                throw new CustomError("Unauthorized",StatusCode.BAD_REQUEST)
            }

            const result = await this._doctorService.fetchNotifications(userId)

            

            return res.status(StatusCode.OK).json(generateSuccessResponse("Notifications fetched", result))
        
       } catch (error) {

        return res.status(error instanceof CustomError ? error.statusCode : StatusCode.INTERNAL_SERVER_ERROR)
        .json(error instanceof CustomError ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR)

        
       }
    }








}

export default DoctorController