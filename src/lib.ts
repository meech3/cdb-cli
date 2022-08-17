import os from "os";
import fs from "fs/promises";
import path from "path";
import utils from "./utils.js";
import logger from "./logger.js";
import fetch from "node-fetch";

async function all(): Promise<void> {
  const databases = await utils.normalizeDatabase("_all_dbs");
  await utils.request(databases, "GET");
}

async function create(args: string[]): Promise<void> {
  utils.validateInput(args, ["database"]);

  const database = await utils.normalizeDatabase(args[0]);
  await utils.request(database, "PUT");
}

async function destroy(args: string[]): Promise<void> {
  if (!args.includes("--commit")) {
    logger.error("missing_flag", "--commit");
    process.exit(1);
  }

  const filteredArgs = args.filter((arg) => arg !== "--commit");
  utils.validateInput(filteredArgs, ["database"]);

  const database = await utils.normalizeDatabase(filteredArgs[0]);
  await utils.request(database, "DELETE");
}

async function info(args: string[]): Promise<void> {
  utils.validateInput(args, ["database"]);

  const database = await utils.normalizeDatabase(args[0]);
  await utils.request(database, "GET");
}

async function replicate(args: string[]): Promise<void> {
  utils.validateInput(args, ["source", "target"]);

  const url = await utils.normalizeDatabase("_replicate");
  let source = await utils.normalizeDatabase(args[0]);
  let target = await utils.normalizeDatabase(args[1]);

  try {
    const defaults = await utils.getDefaults();
    const encoded = Buffer.from(defaults.auth, "utf-8").toString("base64");
    const headers = { Authorization: `Basic ${encoded}` };
    const response = await fetch(target, { method: "GET", headers }).then((data) => data.json());
    if (response.hasOwnProperty("error")) {
      throw Error();
    }
  } catch (error) {
    await create([target]);
  }

  const credentials = await utils.getDefaults().then((defaults) => defaults.auth.split(":"));
  const baseSource = new URL(source);
  const baseTarget = new URL(target);
  baseSource.username = credentials[0];
  baseSource.password = credentials[1];
  baseTarget.username = credentials[0];
  baseTarget.password = credentials[1];
  source = String(baseSource);
  target = String(baseTarget);

  await utils.request(url, "POST", { "Content-Type": "application/json" }, JSON.stringify({ source, target }));
}

async function insert(args: string[]): Promise<void> {
  const expected = ["database", "document"];
  if (args.length < 2) {
    expected.shift();
  }

  utils.validateInput(args, expected);

  let database;
  let document: any;
  if (args.length < 2) {
    document = await utils.normalizeDocument(args[0]);
    database = await utils
      .getDefaults()
      .then(async (defaults) => await utils.normalizeDatabase(defaults.database))
      .then(async (data) => `${data}/${document._id}`);
  } else {
    document = await utils.normalizeDocument(args[1]);
    database = await utils.normalizeDatabase(args[0]).then((data) => `${data}/${document._id}`);
  }

  delete document._id;
  if (document.hasOwnProperty("_rev")) {
    delete document._rev;
  }

  await utils.request(database, "PUT", { "Content-Type": "application/json" }, JSON.stringify(document));
}

async function remove(args: string[]): Promise<void> {
  const expected = ["database", "id"];
  if (args.length < 2) {
    expected.shift();
  }

  utils.validateInput(args, expected);

  let database;
  let id;
  if (args.length < 2) {
    database = await utils.getDefaults().then(async (defaults) => await utils.normalizeDatabase(defaults.database));
    id = args[0];
  } else {
    database = await utils.normalizeDatabase(args[0]);
    id = args[1];
  }

  let url = `${database}/${id}`;
  const rev = await utils.fetchRev(url);
  url += `?rev=${rev}`;

  await utils.request(url, "DELETE");
}

async function read(args: string[]): Promise<void> {
  const expected = ["database", "id"];
  if (args.length < 2) {
    expected.shift();
  }

  utils.validateInput(args, expected);

  let database;
  let id;
  if (args.length < 2) {
    database = await utils.getDefaults().then(async (defaults) => await utils.normalizeDatabase(defaults.database));
    id = args[0];
  } else {
    database = await utils.normalizeDatabase(args[0]);
    id = args[1];
  }

  await utils.request(`${database}/${id}`, "GET");
}

async function update(args: string[]): Promise<void> {
  const expected = ["database", "document"];
  if (args.length < 2) {
    expected.shift();
  }

  utils.validateInput(args, expected);

  let database;
  let document;
  if (args.length < 2) {
    database = await utils.getDefaults().then(async (defaults) => await utils.normalizeDatabase(defaults.database));
    document = await utils.normalizeDocument(args[0]);
  } else {
    database = await utils.normalizeDatabase(args[0]);
    document = await utils.normalizeDocument(args[1]);
  }

  const url = `${database}/${document._id}`;

  if (!document.hasOwnProperty("_rev")) {
    document._rev = await utils.fetchRev(url);
  }

  await utils.request(url, "PUT", { "Content-Type": "application/json" }, JSON.stringify(document));
}

async function set(args: string[]): Promise<void> {
  const defaults = await utils.getDefaults();

  args.reduce((defaults, curr, i) => {
    if (!curr.startsWith("--")) {
      return defaults;
    }

    let option = curr.replace("--", "");
    if (option !== "url" && option !== "auth" && option !== "database") {
      logger.error("invalid_option", args[i]);
      process.exit(1);
    }

    if (args.length < i + 1) {
      logger.error("missing_value", args[i]);
      process.exit(1);
    }

    defaults[option] = args[i + 1];
    return defaults;
  }, defaults);

  const filePath = path.join(os.homedir(), ".cdb.json");

  try {
    await fs.writeFile(filePath, JSON.stringify(defaults));
    console.log({ ok: true });
  } catch (error) {
    logger.error("missing_file", filePath, String(error));
    process.exit(1);
  }
}

async function help(): Promise<void> {
  console.log(`
  For complete documentation visit https://github.com/meech3/cdb-cli.

  Set default: cdb set <option> <value>
  Create database: cdb create <database>
  Delete database: cdb destroy <database> --commit
  Database info: cdb info <database>
  Get all databases: cdb all
  Replicate database: cdb <source> <target>
  Insert document: cdb insert <database> <document>
  Delete document: cdb delete <id> <rev>
  Read document: cdb read <database> <id>
  Update document: cdb update <database> <src>
  `);
}

async function version(): Promise<void> {
  const location = new URL("../package.json", import.meta.url);
  const data = await fs.readFile(location, "utf-8").then((pkg) => JSON.parse(pkg));

  console.log(data.version);
}

export default {
  all,
  create,
  destroy,
  info,
  replicate,
  insert,
  remove,
  read,
  update,
  set,
  help,
  version,
};
