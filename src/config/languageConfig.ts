import { LanguageConfig } from "../types/main";

const TEMP_FILE_LOCATION = './temp/';
const EXECUTABLES_LOCATION = `${TEMP_FILE_LOCATION}exec_temp/`;

export const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
    "c": {
        file_path: `${TEMP_FILE_LOCATION}execute.c`,
        get output_binary() { return `${EXECUTABLES_LOCATION}a.out`; },
        get compile_command() { return `gcc ${this.file_path} -o ${this.output_binary}`; },
        get execute_command() { return `./${this.output_binary}`; },
        type: 'static'
    },
    "cpp": {
        file_path: `${TEMP_FILE_LOCATION}execute.cpp`,
        get output_binary() { return `${EXECUTABLES_LOCATION}a.out`; },
        get compile_command() { return `g++ ${this.file_path} -o ${this.output_binary}`; },
        get execute_command() { return `./${this.output_binary}`; },
        type: 'static'
    },
    "python": {
        file_path: `${TEMP_FILE_LOCATION}execute.py`,
        get output_binary() { return this.file_path; },
        get compile_command() { return `python3 ${this.file_path}`; },
        get execute_command() { return `python3 ${this.file_path}`; },
        type: 'dynamic'
    },
    "go": {
        file_path: `${TEMP_FILE_LOCATION}execute.go`,
        get output_binary() { return `${EXECUTABLES_LOCATION}execute`; },
        get compile_command() { return `go build -o ${this.output_binary} ${this.file_path}`; },
        get execute_command() { return `./${this.output_binary}`; },
        type: 'static'
    },
    "java": {
        file_path: `${TEMP_FILE_LOCATION}Main.java`,
        get output_binary() { return `${EXECUTABLES_LOCATION}Main`; },
        get compile_command() { return `javac ${this.file_path} -d ${EXECUTABLES_LOCATION}`; },
        get execute_command() { return `java -cp ${EXECUTABLES_LOCATION} Main`; },
        type: 'static'
    }
}

// supported: c, cpp, go, java, python