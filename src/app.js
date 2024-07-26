import dotenv from "dotenv";
import express from "express";
import { errorHandler } from "./middlewares/error.handler.js";
import { myRouter } from "./routes/allRouters.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(express.json());
app.use("/", myRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server power on and running at HTTP://localhost:${PORT}`);
});
