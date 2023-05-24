import { writeFileSync } from "fs";
import _ from "lodash";
export class CustomError extends Error {
  public logMessage: string;
  public userMessage: string;
  public status: number;
  public fnName: string;
  public actualError: string;

  constructor({
    err,
    message,
    status,
    userMessage,
    fnName,
  }: {
    err: unknown;
    message: string;
    status: number;
    userMessage: string;
    fnName: string;
  }) {
    super(message);
    this.status = status;
    this.logMessage = message;
    this.userMessage = userMessage;
    this.fnName = fnName;
    this.actualError = _.isEmpty(err) ? JSON.stringify(this) : JSON.stringify(err);

    this.logError();
  }

  logError() {
    writeFileSync(`./logs/${this.fnName}.log`, `${this.actualError}\n`);
  }
}
