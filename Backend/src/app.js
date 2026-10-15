const express = require("express");
const app = express();
app.set("trust proxy", 1);
const cookieParser = require("cookie-parser");
const cors = require('cors')

app.use(express.json());

// Catch invalid JSON syntax errors in request bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON format in request body" });
  }
  next(err);
});

app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : null;
        if (!origin || origin.startsWith("http://localhost:") || origin.endsWith(".vercel.app") || origin === frontendUrl) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));

const authRouter = require("../src/routes/auth.routes");
const interviewRouter = require("../src/routes/interview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview",interviewRouter);

module.exports = app;
