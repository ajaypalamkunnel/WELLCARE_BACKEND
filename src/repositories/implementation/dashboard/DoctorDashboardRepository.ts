import { Types } from "mongoose";
import { AppointmentStatusSummary, AppointmentTrendData, RevenueTrendData, TopServiceData } from "../../../types/dashboardDto";
import IDoctorDashboardRepository from "../../interfaces/dashboard/IDoctorDashboardRepository";
import ConsultationAppointmentModal, { IConsultationAppointment } from "../../../model/consultationBooking/consultationBooking";
import { CustomError } from "../../../utils/CustomError";
import { StatusCode } from "../../../constants/statusCode";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);



class DoctorDashboardRepository implements IDoctorDashboardRepository {




    async getAppointmentStatusSummary(doctorId: Types.ObjectId, startDate?: Date, endDate?: Date): Promise<AppointmentStatusSummary> {
        try {


            const match: any = { doctorId }


            if (startDate && endDate) {
                match.appointmentDate = {
                    $gte: startDate,
                    $lte: endDate,
                };
            }

            const results = await ConsultationAppointmentModal.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ])


            const summary: AppointmentStatusSummary = {
                total: 0,
                booked: 0,
                completed: 0,
                cancelled: 0,
                pending: 0,
            };

            results.forEach((entry) => {
                const status = entry._id;
                const count = entry.count

                summary.total += count;
                if (summary.hasOwnProperty(status)) {
                    summary[status as keyof AppointmentStatusSummary] = count;
                }

            })




            return summary
        } catch (error) {

            throw new CustomError("Error fetching appointment summary: ", StatusCode.INTERNAL_SERVER_ERROR)

        }
    }



    async getAppointmentTrend(doctorId: Types.ObjectId, startDate: Date, endDate: Date, interval: "day" | "week" | "month"): Promise<AppointmentTrendData[]> {
        try {

            const appointments = await ConsultationAppointmentModal.find({
                doctorId,
                appointmentDate: {
                    $gte: startDate,
                    $lte: endDate,
                },

                status: { $in: ["booked", "completed", "cancelled", "pending"] },
            })

            const trendMap = new Map<string, AppointmentTrendData>();

            appointments.forEach((appointment) => {
                const date = dayjs(appointment.appointmentDate);
                let key: string

                if (interval === "day") {
                    key = date.format("YYYY-MM-DD");
                } else if (interval === "week") {
                    key = `${date.isoWeekYear()}-W${date.isoWeek()}`;
                } else {
                    key = date.format("YYYY-MM");
                }

                if (!trendMap.has(key)) {
                    trendMap.set(key, {
                        dateLabel: key,
                        booked: 0,
                        completed: 0,
                        cancelled: 0,
                    });
                }


                const group = trendMap.get(key)!;

                switch (appointment.status) {
                    case "booked":
                    case "pending":
                        group.booked += 1;
                        break;
                    case "completed":
                        group.completed += 1;
                        break;
                    case "cancelled":
                        group.cancelled += 1;
                        break;
                }

            })

            return Array.from(trendMap.values()).sort((a, b) =>
                dayjs(a.dateLabel).isBefore(dayjs(b.dateLabel)) ? -1 : 1
            );

        } catch (error) {
            console.error("Error in getAppointmentTrendData:", error);
            throw new Error("Failed to fetch appointment trend: " + error);
        }
    }
    async getRevenueTrend(doctorId: Types.ObjectId, startDate: Date, endDate: Date, interval: "day" | "week" | "month"): Promise<RevenueTrendData[]> {
        try {

            const groupFormat =
                interval === "day"
                    ? { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } }
                    : interval === "week"
                        ? { $dateToString: { format: "%Y-%U", date: "$appointmentDate" } }
                        : { $dateToString: { format: "%Y-%m", date: "$appointmentDate" } };

            const revenueData = await ConsultationAppointmentModal.aggregate<RevenueTrendData>(
                [
                    {
                        $match: {
                            doctorId,
                            appointmentDate: { $gte: startDate, $lte: endDate },
                            status: "completed",
                            paymentStatus: "paid"
                        }
                    },
                    {
                        $lookup: {
                            from: "services",
                            localField: "serviceId",
                            foreignField: "_id",
                            as: "service"
                        }
                    },
                    { $unwind: "$service" },
                    {
                        $group: {
                            _id: groupFormat,
                            totalRevenue: { $sum: "$service.fee" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } },
                    {
                        $project: {
                            label: "$_id",
                            totalRevenue: 1,
                            count: 1,
                            _id: 0
                        }
                    }
                ]
            )

            return revenueData

        } catch (error) {

            console.error("Error in get revenue Trend Data:", error);
            throw new Error("Failed to fetch revenue Trend: " + error);

        }
    }


    async getAppointmentsForReport(doctorId: Types.ObjectId, startDate: Date, endDate: Date): Promise<IConsultationAppointment[]> {
        return await ConsultationAppointmentModal.find({
            doctorId,
            appointmentDate: { $gte: startDate, $lte: endDate }
        })
            .populate("patientId", "fullName email mobile")
            .populate("serviceId", "name fee")
            .sort({ appointmentDate: -1 })
            .lean()
    }








    async getTopServices(doctorId: Types.ObjectId, startDate?: Date, endDate?: Date, interval?: "day" | "week" | "month"): Promise<TopServiceData[]> {
        try {

            const match: any = {
                doctorId,
                status: { $in: ["completed"] },
                paymentStatus: "paid",
            }

            if (startDate && endDate) {
                match.appointmentDate = { $gte: startDate, $lte: endDate };
            }


            const result = await ConsultationAppointmentModal.aggregate([
                {
                    $match: {
                        doctorId,
                        status: "completed",
                        paymentStatus: "paid",
                        ...(startDate && endDate && {
                            appointmentDate: { $gte: startDate, $lte: endDate }
                        }),
                    }
                },
                {
                    $lookup: {
                        from: "services",
                        localField: "serviceId",
                        foreignField: "_id",
                        as: "service"
                    }
                },
                { $unwind: { path: "$service", preserveNullAndEmptyArrays: false } },
                {
                    $group: {
                        _id: "$serviceId",
                        serviceName: { $first: "$service.name" },
                        totalAppointments: { $sum: 1 },
                        totalRevenue: { $sum: { $ifNull: ["$service.fee", 0] } }
                    }
                },
                { $sort: { totalRevenue: -1 } }
            ]);

            console.log("****", result as TopServiceData[]);
            return result as TopServiceData[];


        } catch (error) {
            throw new CustomError("Top Service fetching error", StatusCode.INTERNAL_SERVER_ERROR)
        }
    }

}


export default DoctorDashboardRepository