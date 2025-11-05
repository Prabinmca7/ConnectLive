// src/mockData.js
export const mockChats = [
    {
      id: 1,
      name: "Prabin GD",
      email: "prabin@example.com",
      status: "active", // or "ended"
      messages: [
        { from: "Prabin GD", message: "Hi there!" },
        { from: "You", message: "Hello Prabin, how can I help?" },
        { from: "Prabin GD", message: "I have an issue with login." },
      ],
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@example.com",
      status: "ended",
      messages: [
        { from: "John Doe", message: "Thanks for the help!" },
        { from: "You", message: "Glad to assist, have a great day!" },
      ],
    },
  ];
  