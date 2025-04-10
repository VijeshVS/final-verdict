import { runCommand } from "../sandbox/runner";
import { CodeJudgeStatus, CodeOutput, TestCase, LanguageConfig, ProcessSignal } from "../types/main";
import pidusage from "pidusage";
import { normalizeOutput } from "../utils/normalizer";

export async function executeTestCase(
  testcase: TestCase,
  config: LanguageConfig,
  timeLimit: number,
  memoryLimit: number
): Promise<CodeOutput> {
  const time_before_execution = new Date();
  return new Promise((resolve) => {
    const [command, ...args] = config.execute_command.split(" ");
    const process = runCommand(command, args);

    let output = "";
    let statusCode = CodeJudgeStatus.PENDING;
    let errMessage: string | null = null;
    let maxMemoryUsed = 0;

    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    const timeoutId = setTimeout(() => {
      statusCode = CodeJudgeStatus.TIME_LIMIT_EXCEEDED;
      errMessage = "Time Limit Exceeded";
      process.kill(ProcessSignal.ImmediateTermination);
    }, timeLimit * 1000);

    const intervalId = setInterval(() => {
      const pid = process.pid;
      if (pid) {
        pidusage(pid, (err, stats) => {
          const memoryUsage = stats.memory / 1024 / 1024;
          maxMemoryUsed = Math.max(maxMemoryUsed, memoryUsage);
          if (memoryUsage > memoryLimit) {
            statusCode = CodeJudgeStatus.MEMORY_LIMIT_EXCEEDED;
            errMessage = "Memory Limit Exceeded";
            process.kill(ProcessSignal.ImmediateTermination);
          }
        });
      }
    }, 100);

    process.on("close", (_code, signal) => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      const time_after_execution = new Date();

      const normalizedOutput = normalizeOutput(output);
      const normalizedExpected = normalizeOutput(testcase.output);

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

      if (statusCode === CodeJudgeStatus.PENDING) {
        if (signal === ProcessSignal.SegementationFault || signal === ProcessSignal.ImmediateTermination) {
          currentOutput.status = CodeJudgeStatus.RUNTIME_ERROR;
          currentOutput.error = signal === ProcessSignal.SegementationFault ? "Segmentation Fault" : "Runtime Error";
        } else if (normalizedExpected === normalizedOutput) {
          currentOutput.status = CodeJudgeStatus.ACCEPTED;
        } else {
          currentOutput.status = CodeJudgeStatus.WRONG_ANSWER;
        }
      }

      resolve(currentOutput);
    });

    process.stdin.write(testcase.input);
    process.stdin.end();
  });
}
