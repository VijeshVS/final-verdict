import express, { Request, Response } from "express";
import { judge } from "./judge"; // Your judge function;

const app = express();
const PORT = 3000;

app.use(express.json());

interface TestCase {
  input: string;
  output: string;
}

interface JudgeRequest {
  language: string;
  code: string;
  test_cases: TestCase[];
  time_limit?: number; // optional, defaults
  memory_limit?: number; // optional, defaults
}

app.post("/submit", async (req: Request, res: Response): Promise<any> => {
  const {
    language,
    code,
    test_cases,
    time_limit = 5,
    memory_limit = 256,
  }: JudgeRequest = req.body;

  if (!language || !code || !test_cases) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const result = await judge(language, code, test_cases, time_limit, memory_limit);
    res.json(result);
  } catch (err) {
    console.error("Judge error:", err);
    res.status(500).json({ error: "Code judging failed." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
