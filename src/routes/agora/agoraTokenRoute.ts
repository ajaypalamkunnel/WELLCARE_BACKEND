import express, { Request, Response } from "express";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { StatusCode } from "../../constants/statusCode";

const agoraRouter = express.Router();


const APP_ID = process.env.AGORA_APP_ID!;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE!;
const EXPIRE_TIME = parseInt(process.env.AGORA_TOKEN_EXPIRE_SECONDS || "3600", 10);


agoraRouter.post("/token", (req: Request, res: Response) => {
    try {
        const { channelName, uid, role } = req.body;

        if (!channelName || !uid || !role) {
            res.status(400).json({ error: "Missing required fields" });
            return
        }

        const agoraRole = role === "host" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const expireTimestamp = currentTimestamp + EXPIRE_TIME;

        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uid,
            agoraRole,
            expireTimestamp
        );


        res.status(StatusCode.OK).json({ token });
        return
    } catch (error) {
        console.error("Failed to generate Agora token", error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
        return
    }
});

export default agoraRouter;