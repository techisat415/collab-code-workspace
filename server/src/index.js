import express, { json } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Collaborative Code Editor"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});