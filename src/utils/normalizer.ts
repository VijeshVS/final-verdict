export function normalizeOutput(output: string): string {
    return output.trim().split("\n").map(line => line.trim()).join("\n");
}