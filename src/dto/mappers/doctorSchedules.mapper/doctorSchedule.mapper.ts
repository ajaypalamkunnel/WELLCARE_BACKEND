import { IDoctorAvailability } from "../../../model/doctorService/doctorSchedule";
import { DoctorScheduleDTO, SlotDTO } from "../../doctorSchedulesDto/doctorSchedule.dto";

// Use `.toObject()` to safely access lean object
export const mapDoctorScheduleToDTO = (scheduleDoc: IDoctorAvailability): DoctorScheduleDTO => {
  const schedule = scheduleDoc.toObject();

  const serviceData = schedule.serviceId && typeof schedule.serviceId === "object"
    ? {
        _id: schedule.serviceId._id?.toString(),
        name: schedule.serviceId.name,
        mode: schedule.serviceId.mode,
        fee: schedule.serviceId.fee,
      }
    : {
        _id: schedule.serviceId.toString(),
        name: "",
        mode: "Online",
        fee: 0,
      };

  const availability: SlotDTO[] = schedule.availability.map((slot:SlotDTO) => ({
    slot_id: slot.slot_id.toString(),
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: slot.status,
    is_break: slot.is_break,
  }));

  return {
    _id: schedule._id.toString(),
    doctorId: schedule.doctorId.toString(),
    serviceId: serviceData,
    date: schedule.date,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    duration: schedule.duration,
    isCancelled: schedule.isCancelled,
    cancellationReason: schedule.cancellationReason,
    cancelledAt: schedule.cancelledAt,
    availability,
  };
};

export const mapDoctorSchedulesToDTO = (
  schedules: IDoctorAvailability[]
): DoctorScheduleDTO[] => {
  return schedules.map(mapDoctorScheduleToDTO);
};
