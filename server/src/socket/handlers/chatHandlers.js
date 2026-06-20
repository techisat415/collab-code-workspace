export default function chatHandlers(socket, io) {

  socket.on("send-chat-message", ({ roomId, message }) => {
      io.to(roomId).emit(
        "receive-chat-message",
        {
          userId: socket.user.userId,
          username: socket.user.username,
          message,
          timestamp: Date.now(),
        });
    }
  );

}