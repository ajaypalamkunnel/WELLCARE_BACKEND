// import DoctorSchedules from "../model/doctorService/doctorSchedule";
// import * as repo from "../repositories/implementation/user/userRepository";
// import mongoose from "mongoose";

// // Mock the model
// jest.mock("../model/doctorService/doctorSchedule");


// describe("fetchDoctorDaySchedule", () => {
//     afterEach(() => {
//       jest.clearAllMocks();
//     });
  
//     it("should return schedules for given doctor and date", async () => {
//       const mockSchedules = [
//         {
//           _id: new mongoose.Types.ObjectId(),
//           doctorId: new mongoose.Types.ObjectId(),
//           date: new Date("2025-04-17"),
//           availability: [],
//           serviceId: {
//             _id: new mongoose.Types.ObjectId(),
//             name: "Consultation",
//             fee: 1000,
//             mode: "Online",
//           },
//           start_time: new Date(),
//           end_time: new Date(),
//           duration: 50,
//         },
//       ];
  
//       // Mock the `.find().populate().sort()` chain
//       (DoctorSchedules.find as jest.Mock).mockReturnValue({
//         populate: jest.fn().mockReturnThis(),
//         sort: jest.fn().mockResolvedValue(mockSchedules),
//       });
  
//       const result = await repo.fetchDoctorDaySchedule("doctor123", new Date("2025-04-17"));
//       expect(result).toEqual(mockSchedules);
//       expect(DoctorSchedules.find).toHaveBeenCalled();
//     });
  
//     it("should throw CustomError if DB fails", async () => {
//       (DoctorSchedules.find as jest.Mock).mockImplementation(() => {
//         throw new Error("DB error");
//       });
  
//       await expect(
//         repo.fetchDoctorDaySchedule("doctor123", new Date("2025-04-17"))
//       ).rejects.toThrow("Failed to fetch doctor schedules.");
//     });
//   });
  