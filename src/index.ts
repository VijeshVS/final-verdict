import { judge } from "./judge";


const code = `
[[],[],[]]
`;

const test_cases = [
  { input: `13 2`, output: `37` },
];

judge("python", code, test_cases, 5, 256).then(console.log);
