class Logger {
  handler: any = {};
  mode: string | undefined;

  constructor(mode: string | undefined) {
    this.mode = mode;
  }

  add(label: string, func: Function): void {
    this.handler[label] = func;
  }

  error(label: string, issue: string | null = null, error: string | null = null): void {
    if (this.mode === "dev" && error) {
      console.error(error);
    }

    console.error({
      error: label,
      reason: this.handler[label](issue),
    });
  }
}

const logger = new Logger(process.env.MODE);

logger.add("invalid_command", (issue: string) => `Command "${issue}" is not a valid command`);
logger.add("invalid_option", (issue: string) => `Option "${issue}" is not a valid option.`);
logger.add("invalid_database", (issue: string) => `Database "${issue}" was not found.`);
logger.add(
  "invalid_path",
  (issue: string) => `Path "${issue}" does not point to a valid document.`
);
logger.add("missing_file", (issue: string) => `File "${issue}" is either missing or corrupted.`);
logger.add("missing_flag", (issue: string) => `The "${issue}" flag is required.`);
logger.add("missing_argument", (issue: string) => `Missing argument(s) for "${issue}".`);
logger.add("missing_value", (issue: string) => `No value was provided for option "${issue}".`);
logger.add("missing_id", () => 'The provided document must contain an "_id" field');
logger.add("not_found", (issue: string) => `No document was found with an ID of "${issue}"`);
logger.add("argument_overload", () => "Too many arguments were provided to this command.");

export default logger;
