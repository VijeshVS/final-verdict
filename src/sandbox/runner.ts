import { spawn, ChildProcessWithoutNullStreams } from "child_process";

export function runCommand(command: string, args: string[]): ChildProcessWithoutNullStreams {
  return spawn(command, args, { stdio: "pipe" });
}