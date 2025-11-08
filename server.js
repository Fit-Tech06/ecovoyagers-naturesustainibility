// 🌿 Nature Sustainability Backend
// Built with Express, Multer, and CORS

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use("/uploads", express.static(uploadDir));

// Mock in-memory database
let users = [];

// ============================
// 🔹 REGISTER ROUTE
// ============================
app.post(
  "/register",
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  (req, res) => {
    const { fullName, username, phone, email, password } = req.body;

    // Validate required fields
    if (!fullName || !username || !phone || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    // Check for duplicates
    if (users.find((u) => u.username === username || u.phone === phone || u.email === email)) {
      return res.status(409).json({ success: false, message: "User already registered!" });
    }

    const idProof = req.files["idProof"] ? req.files["idProof"][0].filename : null;
    const selfie = req.files["selfie"] ? req.files["selfie"][0].filename : null;

    const newUser = { fullName, username, phone, email, password, idProof, selfie };
    users.push(newUser);

    console.log("✅ New Registration:", newUser);

    return res.json({ success: true, message: "Registered successfully!" });
  }
);

// ============================
// 🔹 LOGIN ROUTE
// ============================
app.post("/login", (req, res) => {
  const { usernameOrPhone, password } = req.body;

  if (!usernameOrPhone || !password) {
    return res.status(400).json({ success: false, message: "Please fill in all fields!" });
  }

  const user = users.find(
    (u) =>
      (u.username === usernameOrPhone ||
        u.phone === usernameOrPhone ||
        u.email === usernameOrPhone) &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials!" });
  }

  console.log("🔐 User logged in:", user.username);
  return res.json({
    success: true,
    message: `Welcome back, ${user.fullName}!`,
  });
});

// ============================
// 🔹 ROOT ROUTE
// ============================
app.get("/", (req, res) => {
  res.send("🌿 Nature Sustainability Backend is running successfully!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
