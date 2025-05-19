import cron from 'node-cron'
import DoctorScheduleRepository from '../repositories/implementation/doctorService/doctorScheduleRepository'




const scheduleRepository = new DoctorScheduleRepository()



export const startPendingSlotCleanupJob = async () =>{

    // await connectDB()


    cron.schedule("*/5 * * * *",async ()=>{
        try {

            console.log("⏳ Running pending slot cleanup job...");

            const result = await scheduleRepository.releaseExpiredPendingSlots(10)

            console.log(`✅ Cleaned pending slots: ${result.modifiedCount}`);
            
        } catch (error) {
            console.error("❌ Failed to cleanup pending slots:", error);
        }
    })

}