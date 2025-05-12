import { StatusCode } from "../../../constants/statusCode";
import PaymentModel from "../../../model/bookingPayment/bookingPayment";
import ConsultationAppointmentModal from "../../../model/consultationBooking/consultationBooking";
import DoctorSubscription, {
    IDoctorSubscription,
} from "../../../model/subscription/doctorSubscriptions";
import {
    IDoctorSubscriptionPopulated,
    PlanDistributionDTO,
    RevenueTrendDTO,
} from "../../../types/admin/adminDashboardDto";
import { CustomError } from "../../../utils/CustomError";
import IAdminDashboardRepository from "../../interfaces/adminDashboard/IAdminDashboard";

class AdminDashboardRepository implements IAdminDashboardRepository {
    async getTotalRevenue(): Promise<number> {
        const result = await DoctorSubscription.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                },
            },
            {
                $lookup: {
                    from: "subscriptions", // collection name (Mongo uses lowercase + plural by default)
                    localField: "planId",
                    foreignField: "_id",
                    as: "plan",
                },
            },
            {
                $unwind: "$plan",
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$plan.finalPrice" },
                },
            },
        ]);

        return result[0]?.total || 0;
    }

    async getActiveSubscriptionCount(): Promise<number> {
        return await DoctorSubscription.countDocuments({ status: "active" });
    }
    async getMostSubscribedPlans(
        limit = 5
    ): Promise<{ planName: string; subscriptionCount: number }[]> {
        const result = await DoctorSubscription.aggregate([
            {
                $group: {
                    _id: "$planId",
                    subscriptionCount: { $sum: 1 },
                },
            },
            { $sort: { subscriptionCount: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "_id",
                    as: "plan",
                },
            },
            { $unwind: "$plan" },
            {
                $project: {
                    planName: "$plan.planName",
                    subscriptionCount: 1,
                },
            },
        ]);

        return result;
    }

    async getRevenueTrend(
        startDate: Date,
        endDate: Date,
        interval: "day" | "week" | "month"
    ): Promise<RevenueTrendDTO[]> {
        try {
            console.log("Start Date:", startDate);
            console.log("End Date:", endDate);

            const dateFormat = {
                day: "%Y-%m-%d",
                week: "%Y-%U",
                month: "%Y-%m",
            }[interval];

            const result = await DoctorSubscription.aggregate([
                {
                    $match: {
                        paymentStatus: "paid",
                        createdAt: { $gte: startDate, $lte: endDate },
                        "paymentDetails.paymentAmount": { $gt: 0 }, // ensure data is valid
                    },
                },
                {
                    $group: {
                        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
                        totalRevenue: { $sum: "$paymentDetails.paymentAmount" },
                        transactionCount: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
                {
                    $project: {
                        label: "$_id",
                        totalRevenue: 1,
                        transactionCount: 1,
                        _id: 0,
                    },
                },
            ]);

            console.log("Reveneue trend : ", result);

            return result;
        } catch (error) {
            throw new CustomError(
                "revenue summary fethching error :",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getPlanDistribution(
        startDate?: Date,
        endDate?: Date
    ): Promise<PlanDistributionDTO[]> {
        try {
            const match: any = {
                paymentStatus: "paid",
            };

            if (startDate && endDate) {
                match.createdAt = { $gte: startDate, $lte: endDate };
            }

            const result = await DoctorSubscription.aggregate([
                { $match: match },
                {
                    $lookup: {
                        from: "subscriptions",
                        localField: "planId",
                        foreignField: "_id",
                        as: "plan",
                    },
                },
                { $unwind: "$plan" },
                {
                    $group: {
                        _id: "$plan.planName",
                        subscriptionCount: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        planName: "$_id",
                        subscriptionCount: 1,
                        _id: 0,
                    },
                },
                { $sort: { subscriptionCount: -1 } },
            ]);

            return result;
        } catch (error) {
            throw new CustomError(
                "Failed to fetch plan distribution",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getSubscriptionsForReport(
        startDate?: Date,
        endDate?: Date
    ): Promise<IDoctorSubscriptionPopulated[]> {
        try {
            const match: any = {
                paymentStatus: "paid",
            };

            if (startDate && endDate) {
                match.createdAt = { $gte: startDate, $lte: endDate };
            }

            const result = await DoctorSubscription.find(match)
                .populate({
                    path: "doctorId",
                    select: "fullName email",
                })
                .populate({
                    path: "planId",
                    select: "planName finalPrice",
                })
                .sort({ createdAt: -1 })
                .lean();

            return result as unknown as IDoctorSubscriptionPopulated[];
        } catch (error) {
            throw new CustomError(
                "report generation data error",
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getDoctorAnalyticsSummary(): Promise<any[]> {
        try {
            const result = await ConsultationAppointmentModal.aggregate([
                {
                    $match: {
                        status: "completed",
                        paymentStatus: "paid",
                    },
                },
                {
                    $lookup: {
                        from: "payments",
                        localField: "_id",
                        foreignField: "appointmentId",
                        as: "paymentInfo",
                    },
                },
                { $unwind: "$paymentInfo" },

                {
                    $group: {
                        _id: "$doctorId",
                        totalRevenue: { $sum: "$paymentInfo.amount" },
                        completedAppointments: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "_id",
                        foreignField: "_id",
                        as: "doctor",
                    },
                },
                { $unwind: "$doctor" },
                {
                    $lookup: {
                        from: "services",
                        localField: "_id",
                        foreignField: "doctorId",
                        as: "services",
                    },
                },
                {
                    $addFields: {
                        averageFee: {
                            $cond: [
                                { $gt: [{ $size: "$services" }, 0] },
                                { $avg: "$services.fee" },
                                0,
                            ],
                        },
                        totalPatients: { $size: "$doctor.reviews" },
                        uniquePatients: {
                            $size: {
                                $setUnion: ["$doctor.reviews.patientId", []],
                            },
                        },
                    },
                },
                {
                    $project: {
                        doctorId: "$_id",
                        fullName: "$doctor.fullName",
                        totalRevenue: 1,
                        completedAppointments: 1,
                        averageFee: 1,
                        retentionRate: {
                            $cond: [
                                { $gt: ["$totalPatients", 0] },
                                { $divide: ["$totalPatients", "$uniquePatients"] },
                                0,
                            ],
                        },
                    },
                },
            ]);

            return result;
        } catch (error) {
            console.error("DoctorAnalyticsRepository Error:", error);
            throw error;
        }
    }

    async getDoctorRevenueTrend(
        startDate: Date,
        endDate: Date,
        interval: "day" | "month"
    ): Promise<any[]> {
        try {
            const dateFormat = interval === "day" ? "%Y-%m-%d" : "%Y-%m";

            const result = await PaymentModel.aggregate([
                {
                    $match: {
                        status: "paid",
                        createdAt: { $gte: startDate, $lte: endDate },
                    },
                },
                {
                    $lookup: {
                        from: "consultationappointments",
                        localField: "appointmentId",
                        foreignField: "_id",
                        as: "appointment",
                    },
                },
                { $unwind: "$appointment" },
                {
                    $group: {
                        _id: {
                            date: {
                                $dateToString: { format: dateFormat, date: "$createdAt" },
                            },
                            doctorId: "$appointment.doctorId",
                        },
                        revenue: { $sum: "$amount" },
                    },
                },

                {
                    $lookup: {
                        from: "doctors",
                        localField: "_id.doctorId",
                        foreignField: "_id",
                        as: "doctor",
                    },
                },
                { $unwind: "$doctor" },
                {
                    $project: {
                        label: "$_id.date",
                        doctorId: "$_id.doctorId",
                        fullName: "$doctor.fullName",
                        revenue: 1,
                        _id: 0,
                    },
                },
                { $sort: { label: 1 } },
            ]);

            return result;
        } catch (error) {
            console.error("Revenue trend aggregation failed:", error);
            throw error;
        }
    }

    async getServiceRevenue(): Promise<any[]> {
        try {
            const result = await PaymentModel.aggregate([
                {
                    $match: { status: "paid" },
                },
                {
                    $lookup: {
                        from: "consultationappointments",
                        localField: "appointmentId",
                        foreignField: "_id",
                        as: "appointment",
                    },
                },
                { $unwind: "$appointment" },
                {
                    $lookup: {
                        from: "services",
                        localField: "appointment.serviceId",
                        foreignField: "_id",
                        as: "service",
                    },
                },
                { $unwind: "$service" },
                {
                    $group: {
                        _id: "$service.name",
                        revenue: { $sum: "$amount" },
                    },
                },
                {
                    $project: {
                        serviceName: "$_id",
                        revenue: 1,
                        _id: 0,
                    },
                },
                { $sort: { revenue: -1 } },
            ]);

            return result;
        } catch (error) {
            console.error("Error in getServiceRevenue:", error);
            throw error;
        }
    }

    async getTopPerformingDoctors(limit: number = 10): Promise<any[]> {
        try {
            const result = await PaymentModel.aggregate([
                {
                    $match: { status: "paid" },
                },
                {
                    $lookup: {
                        from: "consultationappointments",
                        localField: "appointmentId",
                        foreignField: "_id",
                        as: "appointment",
                    },
                },
                { $unwind: "$appointment" },
                {
                    $lookup: {
                        from: "doctors",
                        localField: "appointment.doctorId",
                        foreignField: "_id",
                        as: "doctor",
                    },
                },
                { $unwind: "$doctor" },
                {
                    $group: {
                        _id: "$appointment.doctorId",
                        fullName: { $first: "$doctor.fullName" },
                        totalRevenue: { $sum: "$amount" },
                        appointmentCount: { $sum: 1 },
                    },
                },
                {
                    $sort: { totalRevenue: -1, appointmentCount: -1 },
                },
                {
                    $limit: limit,
                },
                {
                    $project: {
                        doctorId: "$_id",
                        fullName: 1,
                        totalRevenue: 1,
                        appointmentCount: 1,
                        _id: 0,
                    },
                },
            ]);

            return result;
        } catch (error) {
            console.error("Error in getTopPerformingDoctors:", error);
            throw error;
        }
    }
}

export default AdminDashboardRepository;
