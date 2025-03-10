import { ChildProcessWithoutNullStreams, exec, spawn } from "child_process";
import fs from "fs";
import pidusage from "pidusage";
import {
  CodeJudgeStatus,
  CodeOutput,
  LanguageConfig,
  ProcessSignal,
  TestCase,
} from "./types/main";
import { LANGUAGE_CONFIG } from "./config/main";
import dotenv from "dotenv";

dotenv.config();

// Write the code to the file
function writeContent(file_path: string, content: string): void {
  try {
    fs.writeFileSync(file_path, content, "utf-8");
  } catch (error) {
    console.error(`Error writing to file ${file_path}:`, error);
  }
}

// Responsible for executing the code against a given testcase
async function TestCaseRunner(
  testcase: TestCase,
  config: LanguageConfig,
  timeLimit: number,
  memoryLimit: number
): Promise<CodeOutput> {
  const time_before_execution = new Date();
  return new Promise((resolve, _reject) => {
    const [command, ...args] = config.execute_command.split(" ");
    const process: ChildProcessWithoutNullStreams = spawn(command, args, {
      stdio: "pipe",
    });

    let output: string = "";
    let statusCode: number = CodeJudgeStatus.PENDING;
    let errMessage: string | null = null;
    let maxMemoryUsed: number = 0;

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    const timeoutId: NodeJS.Timeout = setTimeout(() => {
      process.kill(ProcessSignal.ImmediateTermination);
      statusCode = CodeJudgeStatus.TIME_LIMIT_EXCEEDED;
      errMessage = "Time Limit Exceeded";
    }, timeLimit * 1000);

    const intervalId: NodeJS.Timeout = setInterval(() => {
      const pid = process.pid;

      // Check if it takes more space than limit set
      if (pid) {
        pidusage(pid, (err, stats) => {
          const memoryUsage = stats.memory / 1024 / 1024;

          maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsage);
          if (memoryUsage > memoryLimit) {
            process.kill(ProcessSignal.ImmediateTermination);
            statusCode = CodeJudgeStatus.MEMORY_LIMIT_EXCEEDED;
            errMessage = "Memory Limit Exceeded";
          }
        });
      }
    }, 100);

    // After the execution of testcase or exit signal by cpu
    process.on("close", (_code, signal) => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      const time_after_execution = new Date();

      const currentOutput: CodeOutput = {
        input: testcase.input,
        expected_output: testcase.output,
        observed_output: output.trim(),
        status: statusCode,
        error: errMessage,
        timeTaken:
          (time_after_execution.getTime() - time_before_execution.getTime()) /
          1000,
        maxMemoryUsed,
      };

      // Is status code is not determined
      if (statusCode == CodeJudgeStatus.PENDING) {
        if (signal == ProcessSignal.SegementationFault) {
          currentOutput.status = CodeJudgeStatus.RUNTIME_ERROR;
          currentOutput.error = "Segementation Fault";
        } else if (signal == ProcessSignal.ImmediateTermination) {
          currentOutput.status = CodeJudgeStatus.RUNTIME_ERROR;
          currentOutput.error = "Runtime Error";
        } else if (testcase.output != output.trim()) {
          currentOutput.status = CodeJudgeStatus.WRONG_ANSWER;
        } else {
          currentOutput.status = CodeJudgeStatus.ACCEPTED;
        }
      }

      resolve(currentOutput);
    });

    process.stdin.write(testcase.input);
    process.stdin.end();
  });
}

function runCode(
  language: string,
  content: string,
  test_cases: TestCase[],
  timeLimit: number,
  memoryLimit: number
): Promise<CodeOutput[]> {
  const config = LANGUAGE_CONFIG[language];
  writeContent(config.file_path, content);

  return new Promise((resolve, _reject) => {
    exec(config.compile_command, async (err, _stdout, stderr) => {
      // If compilation error return
      if (err) {
        resolve([
          {
            input: "",
            expected_output: "",
            observed_output: "",
            status: CodeJudgeStatus.COMPILATION_ERROR,
            error: err.message,
            timeTaken: null,
            maxMemoryUsed: null,
          },
        ]);
      }
      if (stderr) {
        resolve([
          {
            input: "",
            expected_output: "",
            observed_output: "",
            status: CodeJudgeStatus.COMPILATION_ERROR,
            error: stderr.toString(),
            timeTaken: null,
            maxMemoryUsed: null,
          },
        ]);
      }

      // Run code against all test_cases
      const results = await Promise.all(
        test_cases.map((testcase) =>
          TestCaseRunner(testcase, config, timeLimit, memoryLimit)
        )
      );

      resolve(results);
    });
  });
}

const example_code = `
#include <iostream>
using namespace std;

  int main() {
    cout<<"Hello"<<endl;
  }
`;

const example_test_cases = [
  { input: "", output: "hello" },
  { input: "", output: "hi" },
];

runCode("cpp", example_code, example_test_cases, 5, 256).then((res) => {
  console.log(res);
});
