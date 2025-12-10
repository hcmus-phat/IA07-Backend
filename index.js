import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import registerRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import refreshRoute from "./routes/refresh.js";
import { handleLogout } from "./controllers/logoutController.js";
import verifyJWT from "./middlewares/verifyJWT.js";
import protectedContent from "./protected/protected.json" with { type: "json" };
dotenv.config();

const PORT = process.env.PORT || 3500;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    })
);

app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/refresh", refreshRoute);
app.post("/logout", handleLogout);

app.use(verifyJWT);
app.get("/protected", (req, res) => {
    res.json(protectedContent);
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
