import { judge } from "./judge";


const code = `
import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    int a = scanner.nextInt();
    int b = scanner.nextInt();
    System.out.println(a + b);
  }
}
`;

const test_cases = [
  { input: `13 24`, output: `37` },
];

judge("java", code, test_cases, 5, 256).then(console.log);
