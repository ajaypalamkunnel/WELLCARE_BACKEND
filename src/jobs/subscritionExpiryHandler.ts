import cron from 'node-cron'
import DoctorSubscription from '../model/subscription/doctorSubscriptions'
import Doctor from '../model/doctor/doctorModel'

cron.schedule("0 * * * *", async () => {
    try {
        console.log("📅 Running subscription expiry job...");

        const now = new Date();

        const expiredSubscriptions = await DoctorSubscription.find({
            status: "active",
            paymentStatus: "paid", // Only process paid subscriptions
            endDate: { $lte: now }
        });

        // console.log(expiredSubscriptions);
        

        if (expiredSubscriptions.length === 0) {
            console.log("[Cron] No subscriptions expired.");
            return;
        }

        const doctorUpdates = [];

        for (const subscription of expiredSubscriptions) {
            // Expire the subscription
            subscription.status = "expired";
            await subscription.save();

            // Update related doctor
            doctorUpdates.push(
                Doctor.updateOne(
                    { _id: subscription.doctorId, currentSubscriptionId: subscription._id },
                    {
                        $set: {
                            isSubscribed: false,
                            subscriptionExpiryDate: subscription.endDate
                        }
                    }
                )
            );
        }

        // console.log(doctorUpdates);
        

        await Promise.all(doctorUpdates);

        console.log(`✅📅 [Subscription Expiry Job] ${expiredSubscriptions.length} subscriptions expired at ${now.toISOString()}`);
    } catch (error) {
        console.error("[Subscription Expiry Job] Error occurred:", error);
    }
});
