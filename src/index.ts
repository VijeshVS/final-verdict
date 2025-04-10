import { judge } from "./judge";

const code = `#include <iostream>
using namespace std;
int main() {
  cout << "Hello" << endl;
}`;

const test_cases = [
  { input: "", output: "Hello" },
  { input: "", output: "Hi" },
];

judge("cpp", code, test_cases, 5, 256).then(console.log);
