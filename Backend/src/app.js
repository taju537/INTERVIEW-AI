const express = require("express");
const app = express();
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
    origin: "http://localhost:5173",
    credentials: true
}));

const authRouter = require("../src/routes/auth.routes");
const interviewRouter = require("../src/routes/interview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview",interviewRouter);

module.exports = app;
