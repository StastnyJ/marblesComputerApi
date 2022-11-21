import express from "express";
import testSet from "./data/inputs.json";
import passwords from "./data/passwords.json";
import { parseCode, Program, simulateProgram, stripRight } from "./utils/LanguageUtils";

const cors = require("cors");

const app = express();
const port = 8265;

app.use(
  express.raw({
    inflate: true,
    limit: "50mb",
    type: () => true,
  })
);

app.use(
  cors({
    origin: "*",
  })
);

const testProgramOnInput = (input: number[], expectedResult: number[], program: Program) => {
  const simulationResult = simulateProgram(program, input);
  if (simulationResult.status === "fail") return false;
  const output = stripRight(simulationResult.steps[simulationResult.steps.length - 1].stateAfterStep);
  const expectedOutput = stripRight(expectedResult);
  if (output.length !== expectedOutput.length) return false;
  return expectedOutput.map((o, i) => o === output[i]).reduce((a, b) => a && b, true);
};

app.get("/ping", (req, res) => {
  res.send("I am alive");
});

app.post("/submit/:task", (req, res) => {
  const task = req.params.task;
  if (task?.toLowerCase() !== "max" && task?.toLowerCase() !== "nbit" && task?.toLowerCase() !== "sort") return res.status(500).send();
  const code = parseCode(req.body.toString());
  if (code === undefined) return res.json({ status: "wrong", data: "" });
  if (testSet[task.toLowerCase()].map((i) => testProgramOnInput(i.input, i.output, code)).reduce((a, b) => a && b, true))
    return res.json({ status: "correct", data: passwords[task.toLowerCase()] });
  else return res.json({ status: "wrong", data: "" });
});

app.listen(port, () => {
  return console.log(`Express is listening at port ${port}`);
});
