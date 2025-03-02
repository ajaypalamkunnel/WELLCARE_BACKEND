import passport, { use } from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import dotenv from 'dotenv'

import UserRepository from '../repositories/implementation/user/userRepository'
import DoctorRepository from '../repositories/implementation/doctor/doctorRepository'
import DoctorService from '../services/implementation/doctor/doctorService'
import UserService from '../services/implementation/user/userService'


dotenv.config()

const userRepository = new UserRepository()
const doctorRepository = new DoctorRepository()
const userService = new UserService(userRepository)
const doctorService = new DoctorService(doctorRepository)


passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
        passReqToCallback: true
    },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const name = profile.displayName;
                const avatar = profile.photos?.[0].value as string;
                const role = req.query.role  as "patient" | "doctor";
                
                console.log("Received Google Profile:", email, "Role:", role);
                
                if (!email) {
                    return done(new Error("Email not found in Google profile"), false)
                }



                let user;

                if (role === "doctor") {
                    user = await doctorService.findOrCreateUser(email, name, avatar, role)
                } else {
                    user = await userService.findOrCreateUser(email, name, avatar, role)
                }


                console.log("Authenticated User:", user);

                return done(null, user||undefined); // ✅ Fix: Corrected `done()` usage
            } catch (error) {
                return done(error, false)
            }
        }
    )
)

passport.serializeUser((user: any, done) => {
    console.log("Serializing User:", user);
    done(null, { id: user._id, role: user.role });
});

passport.deserializeUser(async (sessionUser: { id: string; role: string }, done) => {
    try {
        let user;

        if (sessionUser.role === "doctor") {
            user = await doctorService.getDoctorById(sessionUser.id)
        } else {
            user = await userService.getUserById(sessionUser.id)
        }
        console.log("Deserializing User:", user);
        
        return done(null, user)
    } catch (error) {
        console.error("Deserialization Error:", error);
        return done(error, false)
    }
})