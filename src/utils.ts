import os from "os";
import fs from "fs/promises";
import path from "path";
import logger from "./logger.js";
import fetch from "node-fetch";

type Defaults = {
  url: string;
  auth: string;
  database: string;
};

function isValidJSON(json: string): boolean {
  try {
    return Boolean(JSON.parse(json));
  } catch (error) {
    return false;
  }
}

function isValidURL(url: string): boolean {
  try {
    return Boolean(new URL(url));
  } catch (error) {
    return false;
  }
}

function validateInput(args: string[], expected: string[]): void {
  if (args.length > expected.length) {
    logger.error("argument_overload");
    process.exit(1);
  }

  expected.forEach((_, i) => {
    if (args.length < i + 1) {
      logger.error("missing_argument", expected[i]);
      process.exit(1);
    }
  });
}

async function getDefaults(): Promise<Defaults> {
  const filePath = path.join(os.homedir(), ".cdb.json");

  try {
    return await fs.readFile(filePath).then((data) => JSON.parse(String(data)));
  } catch (error) {
    logger.error("missing_file", filePath, String(error));
    process.exit(1);
  }
}

async function normalizeDatabase(database: string): Promise<string> {
  if (isValidURL(database)) return database;
  return await getDefaults().then((defaults) => new URL(database, defaults.url).href);
}

async function normalizeDocument(document: string): Promise<any> {
  if (isValidJSON(document)) return JSON.parse(document);

  const pathName = path.join(String(process.env.PWD), document);

  try {
    const file = await fs.readFile(pathName, "utf-8").then((doc) => JSON.parse(doc));
    if (!file.hasOwnProperty("_id")) {
      logger.error("missing_id");
      process.exit(1);
    }

    return file;
  } catch (error) {
    logger.error("invalid_path", pathName, String(error));
    process.exit(1);
  }
}

async function request(url: string, method: string, headers: any = {}, body: string | null = null): Promise<void> {
  const defaults = await getDefaults();
  const encoded = Buffer.from(defaults.auth, "utf-8").toString("base64");
  headers["Authorization"] = `Basic ${encoded}`;

  const response = await fetch(url, { method, headers, body }).then((data) => data.text());
  console.log(JSON.parse(response));
}

async function fetchRev(url: string): Promise<string> {
  const defaults = await getDefaults();
  const encoded = Buffer.from(defaults.auth, "utf-8").toString("base64");
  const headers = { Authorization: `Basic ${encoded}` };

  const response = await fetch(url, { headers }).then((data) => data.json());

  if (response.hasOwnProperty("error")) {
    logger.error("not_found");
    process.exit(1);
  }

  return String(response._rev);
}

export default {
  isValidJSON,
  isValidURL,
  validateInput,
  getDefaults,
  normalizeDatabase,
  normalizeDocument,
  request,
  fetchRev,
};
