import { Request, Response } from "express";
import IUserController from "../../interfaces/user/IUserController";
import { IUserService } from "../../../services/interfaces/user/iuserServices";
import passport from "passport";
import { ERROR_MESSAGES, StatusCode } from "../../../constants/statusCode";
import { CustomError } from "../../../utils/CustomError";
import {
    generateErrorResponse,
    generateSuccessResponse,
} from "../../../utils/response";
import { ChatUser } from "../../../types/chat";
import IWalletService from "../../../services/interfaces/wallet/IWalletService";
import axios from "axios";
class UserController implements IUserController {
    private _userService: IUserService;
    private _walletService: IWalletService;

    constructor(_userService: IUserService, walletService: IWalletService) {
        this._userService = _userService;
        this._walletService = walletService;
    }

    //---------------------------Basic registration -----------------------------------------------

    async registerBasicDetails(req: Request, res: Response): Promise<void> {
        try {
            const { user } = await this._userService.registerBasicDetails(req.body);

            res.status(201).json({ message: "OTP sent to email", email: user.email });
        } catch (error) {
            let errorMessage = "an unexpected error occured";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            res.status(StatusCode.BAD_REQUEST).json({ error: errorMessage });
        }
    }

    //--------------------------- resend OTP -----------------------------------------------

    async resendOtp(req: Request, res: Response): Promise<Response> {
        try {
            const { email } = req.body;
            if (!email) {
                return res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ success: false, error: "Email is required" });
            }
            await this._userService.resendOtp(email);
            return res
                .status(StatusCode.OK)
                .json({ success: true, message: "New OTP sent to email" });
        } catch (error) {
            return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        }
    }

    //--------------------------- Verify OTP -----------------------------------------------

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ error: "Email and OTP are required" });
                return;
            }

            await this._userService.verifyOtp(email, otp);

            res.status(StatusCode.OK).json({
                message: "OTP verified successfully. Your account is now activated.",
            });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                error:
                    error instanceof Error ? error.message : "OTP verification failed",
            });
        }
    }

    //--------------------------- Login post request -----------------------------------------------

    async postLogin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ error: "Email and password are required" });
                return;
            }

            const { accessToken, refreshToken, user } =
                await this._userService.loginUser(email, password);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                domain: ".wellcare.space",
                path:"/",
                maxAge: parseInt(process.env.REFRESH_TOKEN_MAX_AGE || "604800000", 10),
            });

            res.cookie("auth_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                domain: ".wellcare.space",
                path:"/",
                maxAge:parseInt(process.env.ACCESS_TOKEN_MAX_AGE || "7200000", 10),
            });

            res.status(StatusCode.OK).json({
                success: true,
                message: "Login succesful",
                accessToken,
                user: {
                    id: user?._id,
                    email: user?.email,
                    isVerified: user?.isVerified,
                    fullName: user?.fullName,
                },
            });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                error: error instanceof Error ? error.message : "Login failed",
            });
        }
    }

    //--------------------------- renew token -----------------------------------------------

    async renewAuthTokens(req: Request, res: Response): Promise<void> {
        try {
            const oldRefreshToken = req.cookies.refreshToken;


            if (!oldRefreshToken) {
                res
                    .status(StatusCode.UNAUTHORIZED)
                    .json({ error: "Refresh token not found" });
                return;
            }

            const { accessToken } = await this._userService.renewAuthTokens(
                oldRefreshToken
            );

            res.cookie("auth_token", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                domain: ".wellcare.space",
                path:"/",
                maxAge: parseInt(process.env.ACCESS_TOKEN_MAX_AGE || "7200000", 10),
            });

            res.status(StatusCode.OK).json({ success: true, accessToken });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                error:
                    error instanceof Error ? error.message : "Failed to refresh token",
            });
        }
    }

    //---------------------------forgot Password -----------------------------------------------

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;

            if (!email) {
                res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ success: false, error: "Email is required" });
                return;
            }
            await this._userService.forgotPassword(email);

            res
                .status(StatusCode.OK)
                .json({ success: true, message: "New OTP sent to email" });
        } catch (error) {
            console.error("Error in forgotPassword controller:", error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        }
    }

    //---------------------------update Password -----------------------------------------------

    async updatePassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email) {
                res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ success: false, error: "Email is required" });
            }

            await this._userService.updatePasswordUser(email, password);
            res
                .status(StatusCode.OK)
                .json({ success: true, error: "Password Updated Successfully" });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        }
    }

    async googleAuthCallback(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;

            if (!user) {
                res.redirect(
                    `${process.env.FRONTEND_URL}/login?error=AuthenticationFailed`
                );
                return;
            }

            const { accessToken, refreshToken } =
                await this._userService.generateTokens(user);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                domain: ".wellcare.space",
                path:"/",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.cookie("auth_token", accessToken, {
                httpOnly: true, // Prevents client-side access
                secure: process.env.NODE_ENV === "production", // HTTPS only in production
                sameSite: "strict", // Prevents CSRF attacks
                domain: ".wellcare.space",
                path:"/",
                maxAge: 2 * 60 * 60 * 1000, // 15 minutes (short-lived access token)
            });

            res.redirect(
                `${process.env.FRONTEND_URL
                }/auth-success?role=patient&user=${encodeURIComponent(
                    JSON.stringify(user)
                )}&accesstoken=${accessToken}`
            );
        } catch (error) {
            console.error("Google auth error",error)
            
            res.redirect(
                `${process.env.FRONTEND_URL}/login?error=InternalServerError`
            );
        }
    }

    googleAuth = passport.authenticate("google", {
        scope: ["email", "profile"],
        prompt: "select_account",
    });

    //------------------------------- User logout  -----------------------------------

    async logout(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ error: "No refresh token provided" });
                return;
            }

            await this._userService.logoutUser(refreshToken);

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                domain: ".wellcare.space",
                path:"/",
                sameSite: "strict",
            });

            res.cookie("auth_token", "", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                domain: ".wellcare.space",
                path:"/",
                expires: new Date(0), // Expire the cookie immediately
            });

            res.clearCookie("connect.sid", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                domain: ".wellcare.space",
                path:"/",
                sameSite: "strict",
            });

            res
                .status(StatusCode.OK)
                .json({ success: true, message: "Logout successful" });
        } catch (error) {
            console.error("Logout failed",error);
            
            res
                .status(StatusCode.INTERNAL_SERVER_ERROR)
                .json({ error: "Logout failed" });
        }
    }

    //------------------------------- Get user profile -----------------------------------

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(StatusCode.UNAUTHORIZED).json({ error: "Unauthorized" });
                return;
            }

            const user = await this._userService.getUserProfile(req.user.userId);
            if (!user) {
                res.status(404).json({ error: "User not found" });
            }

            res.status(StatusCode.OK).json({ success: true, user });
        } catch (error) {
            console.error("Failed to featch user Profile",error);
            
            res
                .status(StatusCode.INTERNAL_SERVER_ERROR)
                .json({ error: "Failed to featch user Profile" });
        }
    }

    //------------------------------- user blocking and unblocking-----------------------------------

    async UpdateUserStatus(req: Request, res: Response): Promise<void> {
        try {
            const { userId, status } = req.body;

            if (!userId || (status !== 1 && status !== -1)) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message:
                        "Invalid request. Provide UserId and valid status (-1 for block, 1 for unblock).",
                });
                return;
            }

            const user = await this._userService.updateUserStatus(userId, status);

            res.status(StatusCode.OK).json({
                success: true,
                message: `User ${status === -1 ? "Blocked" : "unblocked"} successfully`,
                data: user,
            });
        } catch (error) {
            console.error(
                `Controller Error: ${error instanceof Error ? error.message : error}`
            );
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred",
            });
        }
    }

    //------------------------------- change user password user -----------------------------------

    async changePassword(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, oldPassword, newPassword } = req.body;


            if (!userId || !oldPassword || !newPassword) {
                throw new CustomError(
                    "All fields are required",
                    StatusCode.BAD_REQUEST
                );
            }

            const result = await this._userService.changePassword(
                userId,
                oldPassword,
                newPassword
            );

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse(result.message));
        } catch (error) {
            const errMessage = (error as Error).message || "something went wrong";

            console.error(`Password change error ${errMessage}`);

            return res
                .status(StatusCode.INTERNAL_SERVER_ERROR)
                .json(generateErrorResponse(errMessage));
        }
    }

    async completeUserRegistration(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {

            const { email, fullName, mobile, personalInfo, address } = req.body;

            if (!email || !mobile || !personalInfo || !address) {
                throw new CustomError(
                    "All fields are required",
                    StatusCode.BAD_REQUEST
                );
            }

            const updatedUser = await this._userService.completeUserRegistration(
                email,
                mobile,
                personalInfo,
                address,
                fullName
            );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "User registration completed successfully",
                        updatedUser
                    )
                );
        } catch (error) {
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }

    async getDoctorSchedules(req: Request, res: Response): Promise<Response> {
        try {

            const { doctorId, date } = req.query;

            const schedules = await this._userService.fetchScheduleByDoctorAndDate(
                doctorId as string,
                date as string
            );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Doctor schedules fetched successfully",
                        schedules
                    )
                );
        } catch (error) {
            console.error("Controller Error:", error);

            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }

    async getUserInfoForChat(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.params;

            if (!userId) {
                throw new CustomError("User ID is required", StatusCode.BAD_REQUEST);
            }

            const user = await this._userService.getUserChatInfo(userId);

            const formatted: ChatUser = {
                _id: user._id.toString(),
                fullName: user.fullName,
                profileImage: user?.profileImage,
                lastMessage: "",
                lastMessageTime: "",
                unreadCount: 0,
                isOnline: false,
            };

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("User info featched", formatted));
        } catch (error) {
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }

    async getWalletSummary(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                throw new CustomError("User ID is required", StatusCode.BAD_REQUEST);
            }

            const walletSummary = await this._walletService.getWalletSummary(userId);

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse(
                        "Wallet summary fetched successfully",
                        walletSummary
                    )
                );
        } catch (error) {
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }

    async getWalletTransactions(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                throw new CustomError("User ID is required", StatusCode.BAD_REQUEST);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const sort = (req.query.sort as string) === "asc" ? "asc" : "desc"; // default to "desc"

            const result = await this._walletService.getWalletTransactions(
                userId,
                page,
                limit,
                sort
            );

            return res
                .status(StatusCode.OK)
                .json(
                    generateSuccessResponse("Transactions fetched succesully", result)
                );
        } catch (error) {
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }

    async listNotifications(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                throw new CustomError("Unauthorized", StatusCode.BAD_REQUEST);
            }

            const result = await this._userService.fetchNotifications(userId);

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Notifications fetched", result));
        } catch (error) {
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    error instanceof CustomError
                        ? error.message
                        : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                );
        }
    }

    async downloadPrescription(req: Request, res: Response): Promise<void> {
        const { filename } = req.query;


        const cloudinaryUrl = `https://res.cloudinary.com/dy3yrxbmg/raw/upload/prescriptions/${filename}`;

        try {
            const fileResponse = await axios.get(cloudinaryUrl, {
                responseType: "stream",
            });
            const customDownloadName = `Prescription_${Date.now()}.pdf`;

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${customDownloadName}"`
            );
            res.setHeader("Content-Type", fileResponse.headers["content-type"]);

            fileResponse.data.pipe(res);
        } catch (error) {
            console.error("Failed to download file",error)
            res
                .status(StatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Failed to download file" });
        }
    }

    async addReview(req: Request, res: Response): Promise<Response> {
        try {
            const { doctorId } = req.params;
            const patientId = req.user?.userId;
            const { rating, reviewText } = req.body;
            
            

            if (!doctorId || !patientId || !rating || !reviewText) {
                throw new CustomError(
                    "All fields are required",
                    StatusCode.BAD_REQUEST
                );
            }

            await this._userService.addReviewToDoctor(
                doctorId,
                patientId,
                rating,
                reviewText
            );

            return res
                .status(StatusCode.OK)
                .json(generateSuccessResponse("Review added successfully"));
        } catch (error) {
            console.log("Review submission error : ",error)
            return res
                .status(
                    error instanceof CustomError
                        ? error.statusCode
                        : StatusCode.INTERNAL_SERVER_ERROR
                )
                .json(
                    generateErrorResponse(
                        error instanceof CustomError
                            ? error.message
                            : ERROR_MESSAGES.INTERNAL_SERVER_ERROR
                    )
                );
        }
    }
}

export default UserController;
