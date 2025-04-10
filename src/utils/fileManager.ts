import fs from "fs";

export function writeCodeToFile(file_path: string, content: string): void {
  fs.writeFileSync(file_path, content, "utf-8");
}

export function cleanupFile(file_path: string): void {
  if (fs.existsSync(file_path)) fs.unlinkSync(file_path);
}