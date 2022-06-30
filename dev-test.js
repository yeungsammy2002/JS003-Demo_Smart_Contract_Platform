const Interpreter = require("./Interpreter");

const { STOP, ADD, SUB, MUL, DIV, PUSH, LT, GT, EQ, AND, OR, JUMP, JUMPI } =
  Interpreter.OPCODE_MAP;

let code = [PUSH, 2, PUSH, 3, ADD, STOP];
let result = new Interpreter().runCode(code);
console.log(`Result of 3 ADD 2: ${result}`);

code = [PUSH, 2, PUSH, 3, SUB, STOP];
result = new Interpreter().runCode(code);
console.log(`Result of 3 SUB 2: ${result}`);

code = [PUSH, 2, PUSH, 3, MUL, STOP];
result = new Interpreter().runCode(code);
console.log(`Result of 3 MUL 2: ${result}`);

code = [PUSH, 2, PUSH, 3, DIV, STOP];
result = new Interpreter().runCode(code);
console.log(`Result of 3 DIV 2: ${result}`);

code = [PUSH, 2, PUSH, 3, LT, STOP];
result = new Interpreter().runCode(code);
console.log(`Result of 3 LT 2: ${result}`);

code = [PUSH, 2, PUSH, 3, GT, STOP];
result = new Interpreter().runCode(code);
console.log(`Result of 3 GT 2: ${result}`);

code = [PUSH, 2, PUSH, 2, EQ, STOP];
result = new Interpreter().runCode(code);
console.log(`Result of 2 EQ 2: ${result}`);

code = [PUSH, 1, PUSH, 0, AND, STOP];
result = new Interpreter().runCode(code);
console.log(`Result of 0 AND 1: ${result}`);

code = [PUSH, 1, PUSH, 0, OR, STOP];
result = new Interpreter().runCode(code);
console.log(`Result of 0 OR 1: ${result}`);

code = [PUSH, 6, JUMP, PUSH, 0, JUMP, PUSH, "jump successful", STOP];
result = new Interpreter().runCode(code);
console.log(`Result of JUMP: ${result}`);

code = [PUSH, 8, PUSH, 1, JUMPI, PUSH, 0, JUMP, PUSH, "jump successful", STOP];
result = new Interpreter().runCode(code);
console.log(`Result of JUMPI: ${result}`);

code = [PUSH, 99, JUMP, PUSH, 0, JUMP, PUSH, "jump successful", STOP];
try {
  new Interpreter().runCode(code);
} catch (error) {
  console.log(`Invalid destination error: ${error.message}`);
}

code = [PUSH, 0, PUSH];
try {
  new Interpreter().runCode(code);
} catch (error) {
  console.log(`Expected invalid PUSH error: ${error.message}`);
}

code = [PUSH, 0, JUMP, STOP];
try {
  new Interpreter().runCode(code);
} catch (error) {
  console.log(`Expected invalid execution error: ${error.message}`);
}
