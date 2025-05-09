import { Socket, Server } from "socket.io";
import { onlineUsers } from "../..";


export const registerWebRTCSocketHandlers = (io: Server, socket: Socket) => {

    socket.on("start-call", ({ callerId, receiverId, callerName }) => {

        console.log("start-call", receiverId);


        const receiverSockets = onlineUsers.get(receiverId);

        console.log("receiverSockets", receiverSockets);





        if (receiverSockets) {
            receiverSockets.forEach((id) => {
                console.log(">>>", id, callerName);

                io.to(id).emit("call-request", { callerId, callerName })
            })
        } else {
            socket.emit("call-error", { message: "User is offline" })
        }

    });



    socket.on("accept-call", ({ callerId, receiverId }) => {
        console.log("accept-call");
        const callerSockets = onlineUsers.get(callerId);

        callerSockets?.forEach((id) => {
            io.to(id).emit("call-accepted", { receiverId })
        })
    })

    socket.on("reject-call", ({ callerId, receiverId }) => {
        const callerSockets = onlineUsers.get(callerId);

        callerSockets?.forEach((id) => {
            io.to(id).emit("call-rejected", { receiverId })
        })
    })


    // Doctor sends SDP offer to user
    socket.on("webrtc-offer", ({ targetId, offer }) => {

        if (!targetId || !offer) {
            console.warn("❗ Invalid offer data:", { targetId, offer });
            return;
        }

        const targetSockets = onlineUsers.get(targetId);

        if (!targetSockets || targetSockets.size === 0) {
            console.warn(`❌ No sockets found for targetId ${targetId}`);
            socket.emit("webrtc-error", {
                message: `User with ID ${targetId} is not connected.`,
            });
            return;
        }


        console.log(`📨 Forwarding WebRTC offer to ${targetId}, sockets:`, [...targetSockets]);



        targetSockets?.forEach((id) => {
            io.to(id).emit("webrtc-offer", { offer, senderId: socket.id, });
        });
    });

    // User sends SDP answer back to doctor
    socket.on("webrtc-answer", ({ targetId, answer }) => {
        if (!targetId || !answer) return;

        const targetSockets = onlineUsers.get(targetId);

        console.log("target socket =========>", targetSockets);


        if (!targetSockets || targetSockets.size === 0) {
            socket.emit("webrtc-error", {
                message: `User with ID ${targetId} not connected.`,
            });
            return;
        }

        targetSockets.forEach((id) => {
            io.to(id).emit("webrtc-answer", {
                answer,
                senderId: socket.id,
            });
        });
    });


    socket.on("webrtc-candidate", ({ targetId, candidate }) => {
        console.log("web===>c", candidate, "---", targetId);

        const targetSockets = onlineUsers.get(targetId);
        targetSockets?.forEach((id) => {
            io.to(id).emit("webrtc-candidate", { candidate, senderId: socket.id, });
        });
    });


}