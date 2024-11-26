require("dotenv").config(); // Load environment variables
console.log("MONGO_URL:", process.env.MONGO_URL); // Debug

const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true, // Enables TLS
    tlsAllowInvalidCertificates: true, // For self-signed certificates (use only for testing)
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
