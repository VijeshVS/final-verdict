import { exec } from "child_process";

export function compileCode(command: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    exec(command, (err, _stdout, stderr) => {
      if (err || stderr) {
        resolve({ success: false, error: err?.message || stderr });
      } else {
        resolve({ success: true });
      }
    });
  });
}