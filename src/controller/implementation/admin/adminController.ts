import { Request, Response } from "express";
import IAdminController from "../../interfaces/admin/IAdminController";
import { IAdminService } from "../../../services/interfaces/admin/IAdminServices";

import { StatusCode } from "../../../constants/statusCode";
import Doctor from "../../../model/doctor/doctorModel";
import axios from "axios";
import { lookup } from "mime-types";

/**
 * The `AdminController` class implements the `IAdminController` interface and provides
 * methods for handling administrative operations such as login, logout, fetching doctors,
 * retrieving users, and updating doctor statuses.
 */
class AdminController implements IAdminController {
    private _adminService: IAdminService;

    constructor(adminService: IAdminService) {
        this._adminService = adminService;
    }

    // Handles admin login
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res
                    .status(StatusCode.BAD_REQUEST)
                    .json({ error: "Email and password are required" });
                return;
            }

            const { accessTokenAdmin, refreshTokenAdmin, admin } =
                await this._adminService.loginAdmin(email, password);

            res.cookie("refreshTokenAdmin", refreshTokenAdmin, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.cookie("accessTokenAdmin", accessTokenAdmin, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 2 * 60 * 60 * 1000, // 2 hours
            });

            res.status(StatusCode.OK).json({
                success: true,
                message: "Login successfull",
                accessTokenAdmin,
                admin: { id: admin?._id, email: admin?.email },
            });
        } catch (error: unknown) {
            res.status(StatusCode.BAD_REQUEST).json({
                error: error instanceof Error ? error.message : "Login failed",
            });
        }
    }

    // Handles admin logout
    async logout(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie("refreshTokenAdmin", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            res.clearCookie("accessTokenAdmin", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });

            res.status(StatusCode.OK).json({
                success: true,
                message: "Logout successfull",
            });
        } catch (error: unknown) {
            console.error("admin logout error : ",error);
            
            res
                .status(StatusCode.INTERNAL_SERVER_ERROR)
                .json({ error: "logout failed" });
        }
    }

    // Fetches all doctors
    async fetchAllDoctors(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 6;
            const searchTerm = (req.query.search as string) || "";

            const filters = {
                isVerified: req.query.isVerified as string,
                status: req.query.status as string,
                availability: req.query.availability as string,
                departmentId: req.query.departmentId as string,
                isSubscribed: req.query.isSubscribed as string,
                minExp: req.query.minExp as string,
                maxExp: req.query.maxExp as string,
            };

            const { data, total } = await this._adminService.fetchAllDoctors(
                page,
                limit,
                searchTerm,
                filters
            );
            res.status(StatusCode.OK).json({
                success: true,
                data,
                total,
                message:
                    data.length === 0
                        ? "No doctors found"
                        : "Doctors fetched successfully",
            });
        } catch (error) {
            console.error("Error fetching doctors:", error);
            res
                .status(StatusCode.INTERNAL_SERVER_ERROR)
                .json({ success: false, message: "Internal Server Error" });
        }
    }

    async viewDoctorDocument(req: Request, res: Response): Promise<void> {
        try {
            const { doctorId, type } = req.params;

            const doctor = await Doctor.findById(doctorId).lean();

            if (!doctor) {
                res.status(StatusCode.NOT_FOUND).send("Doctor not found");
                return;
            }
            let documentUrl: string | undefined;

            if (type === "license") {
                documentUrl = doctor.licenseDocument;
            } else if (type === "idproof") {
                documentUrl = doctor.IDProofDocument;
            }

            if (!documentUrl) {
                res.status(404).send("Document not found");
                return;
            }

            const cloudinaryResp = await axios.get(documentUrl, {
                responseType: "stream",
            });

            const mimeType = lookup(documentUrl) || "application/octet-stream";
            res.setHeader("Content-Type", mimeType);

            res.setHeader(
                "Content-Disposition",
                `inline; filename="${type}-${doctor.fullName || doctorId}"`
            );

            cloudinaryResp.data.pipe(res);
        } catch (error) {
            console.error("Failed to fetch doctor document:", error);
            res
                .status(StatusCode.INTERNAL_SERVER_ERROR)
                .send("Internal Server Error");
        }
    }

    // Retrieves all users with pagination
    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const searchTerm = (req.query.search as string) || "";
           

            const { users, totalUsers } = await this._adminService.getAllUsers(
                page,
                limit,
                searchTerm
            );

            res.status(StatusCode.OK).json({
                success: true,
                message:
                    users.length === 0
                        ? "No doctors found"
                        : "Doctors fetched successfully",
                data: {
                    users,
                    totalUsers,
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers! / limit),
                },
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

    // Updates the status of a doctor
    async updateDoctorStatus(req: Request, res: Response): Promise<void> {
        try {
            const { doctorId, status } = req.body;


            if (!doctorId || (status !== 1 && status !== -1)) {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message:
                        "Invalid request. Provide doctorId and valid status (-1 for block, 1 for unblock).",
                });
                return;
            }

            const doctor = await this._adminService.updateDoctorStatus(
                doctorId,
                status
            );

            res.status(StatusCode.OK).json({
                success: true,
                message: `Doctor ${status === -1 ? "blocked" : "unblocked"
                    } successfully.`,
                data: doctor,
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
}

export default AdminController;
