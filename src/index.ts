#!/usr/bin/env node

import lib from "./lib.js";
import logger from "./logger.js";

const command = process.argv[2];
const args = process.argv.slice(3);

(async () => {
  switch (command) {
    case "all":
      lib.all();
      break;
    case "create":
      lib.create(args);
      break;
    case "destroy":
      lib.destroy(args);
      break;
    case "info":
      lib.info(args);
      break;
    case "replicate":
      lib.replicate(args);
      break;
    case "insert":
      lib.insert(args);
      break;
    case "delete":
      lib.remove(args);
      break;
    case "read":
      lib.read(args);
      break;
    case "update":
      lib.update(args);
      break;
    case "set":
      lib.set(args);
      break;
    case "help":
    case "--help":
    case "-h":
      lib.help();
      break;
    case "version":
    case "--version":
    case "-v":
      lib.version();
      break;
    default:
      logger.error("invalid_command", command);
      process.exit(1);
  }
})();
