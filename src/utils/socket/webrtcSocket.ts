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


// ----------------------------------------


// import { Socket, Server } from "socket.io";
// import { onlineUsers } from "../..";

// interface CallRequest {
//   callerId: string;
//   receiverId: string;
//   callerName: string;
// }

// interface WebRTCOffer {
//   targetId: string;
//   offer: RTCSessionDescriptionInit;
// }

// interface WebRTCAnswer {
//   targetId: string;
//   answer: RTCSessionDescriptionInit;
// }

// interface WebRTCCandidate {
//   targetId: string;
//   candidate: RTCIceCandidateInit;
// }

// export const registerWebRTCSocketHandlers = (io: Server, socket: Socket) => {
//   // Validate and get target sockets with error handling
//   const getValidTargetSockets = (targetId: string, operation: string) => {
//     if (!targetId) {
//       console.warn(`❗ ${operation} - Missing targetId`);
//       socket.emit("webrtc-error", { message: "Target user ID is required" });
//       return null;
//     }

//     const targetSockets = onlineUsers.get(targetId);
//     if (!targetSockets || targetSockets.size === 0) {
//       console.warn(`❌ ${operation} - User ${targetId} not found or offline`);
//       socket.emit("webrtc-error", { 
//         message: `User ${targetId} is not available` 
//       });
//       return null;
//     }

//     return targetSockets;
//   };

//   // Call setup handlers
//   socket.on("start-call", ({ callerId, receiverId, callerName }: CallRequest) => {
//     console.log(`📞 Call request from ${callerId} to ${receiverId}`);
    
//     const targetSockets = getValidTargetSockets(receiverId, "start-call");
//     if (!targetSockets) return;

//     targetSockets.forEach(socketId => {
//       io.to(socketId).emit("call-request", { 
//         callerId, 
//         callerName 
//       });
//       console.log(`📩 Sent call request to ${socketId}`);
//     });
//   });

//   socket.on("accept-call", ({ callerId }: { callerId: string }) => {
//     console.log(`✅ Call accepted by ${socket.id}, notifying ${callerId}`);
    
//     const targetSockets = getValidTargetSockets(callerId, "accept-call");
//     if (!targetSockets) return;

//     targetSockets.forEach(socketId => {
//       io.to(socketId).emit("call-accepted");
//     });
//   });

//   socket.on("reject-call", ({ callerId }: { callerId: string }) => {
//     console.log(`❌ Call rejected by ${socket.id}, notifying ${callerId}`);
    
//     const targetSockets = getValidTargetSockets(callerId, "reject-call");
//     if (!targetSockets) return;

//     targetSockets.forEach(socketId => {
//       io.to(socketId).emit("call-rejected");
//     });
//   });

//   // WebRTC signaling handlers
//   socket.on("webrtc-offer", ({ targetId, offer }: WebRTCOffer) => {
//     console.log(`📨 Offer from ${socket.id} to ${targetId}`);
    
//     const targetSockets = getValidTargetSockets(targetId, "webrtc-offer");
//     if (!targetSockets) return;

//     targetSockets.forEach(socketId => {
//       io.to(socketId).emit("webrtc-offer", { 
//         offer,
//         senderId: socket.id // Keep senderId for tracking if needed
//       });
//       console.log(`📤 Forwarded offer to ${socketId}`);
//     });
//   });

//   socket.on("webrtc-answer", ({ targetId, answer }: WebRTCAnswer) => {
//     console.log(`📩 Answer from ${socket.id} to ${targetId}`);
    
//     const targetSockets = getValidTargetSockets(targetId, "webrtc-answer");
//     if (!targetSockets) return;

//     targetSockets.forEach(socketId => {
//       io.to(socketId).emit("webrtc-answer", { 
//         answer,
//         senderId: socket.id
//       });
//       console.log(`📤 Forwarded answer to ${socketId}`);
//     });
//   });

//   socket.on("webrtc-candidate", ({ targetId, candidate }: WebRTCCandidate) => {
//     console.log(`🧊 ICE candidate from ${socket.id} to ${targetId}`);
    
//     const targetSockets = getValidTargetSockets(targetId, "webrtc-candidate");
//     if (!targetSockets) return;

//     targetSockets.forEach(socketId => {
//       io.to(socketId).emit("webrtc-candidate", { 
//         candidate,
//         senderId: socket.id
//       });
//     });
//   });

//   // Error handling
//   socket.on("error", (err) => {
//     console.error(`Socket error (${socket.id}):`, err);
//   });

//   // Cleanup on disconnect
//   socket.on("disconnect", () => {
//     console.log(`🚪 User disconnected: ${socket.id}`);
//     // Add any necessary cleanup logic here
//   });
// };