import { writeCodeToFile } from "./utils/fileManager";
import { compileCode } from "./executor/compiler";
import { executeTestCase } from "./executor/testExecutor";
import { LANGUAGE_CONFIG } from "./config/languageConfig";
import { CodeOutput, CodeJudgeStatus, TestCase } from "./types/main";

export async function judge(
  language: string,
  content: string,
  test_cases: TestCase[],
  timeLimit: number,
  memoryLimit: number
): Promise<CodeOutput[]> {
  const config = LANGUAGE_CONFIG[language];

  writeCodeToFile(config.file_path, content);

  // Compile the code for statically typed lang
  if(config.type == 'static') {
    const compiled = await compileCode(config.compile_command);
    if (!compiled.success) {
      return [
        {
          input: "",
          expected_output: "",
          observed_output: "",
          status: CodeJudgeStatus.COMPILATION_ERROR,
          error: compiled.error || "error",
          timeTaken: null,
          maxMemoryUsed: null,
        },
      ];
    }
  }
  
  const results = await Promise.all(
    test_cases.map((tc) => executeTestCase(tc, config, timeLimit, memoryLimit))
  );

  return results;
}