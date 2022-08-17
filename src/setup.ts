import os from "os";
import fs from "fs/promises";
import path from "path";
import logger from "./logger.js";

(async () => {
  const filePath = path.join(os.homedir(), ".cdb.json");

  try {
    const data = {
      url: "http://localhost:5984",
      auth: "admin:pass",
      database: "",
    };
    await fs.writeFile(filePath, JSON.stringify(data));
  } catch (error) {
    logger.error("missing_file", filePath);
    process.exit(1);
  }
})();
