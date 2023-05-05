const sendButton = document.getElementById("send-button");
const inputMessage = document.getElementById("input-message");
const chatMessages = document.getElementById("chat-messages");

sendButton.addEventListener("click", sendMessage);

function sendMessage() {
    const message = inputMessage.value.trim();
    if (message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", "sent-message");
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);

        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Clear the input field
        inputMessage.value = "";
    }
}

// Handle the Enter key for sending messages
inputMessage.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
