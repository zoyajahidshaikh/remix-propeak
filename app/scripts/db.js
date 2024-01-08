const fs = require("fs");
const path = require("path");
const { execSync, exec } = require("child_process");
const chalk = require("chalk");

const platform = process.platform;

const initialData = fs
  .readFileSync(path.resolve("scripts/data/db.txt"), { encoding: "utf-8" })
  .split("\n");

  // Run all commands from scripts/data/db.txt
function runMongoCMDs() {
  initialData.forEach(cmd => {
    console.log(
      chalk.yellow("Running ") + chalk.green(cmd.substr(0, 60) + " ...")
    );
    return execSync(`mongo localhost/tms --eval '${cmd}'`);
  });
}

/** Checks if mongo exists in System */
function __init__() {
  exec("mongo --version", async (err, stdout, stderr) => {
    // if anything goes wrong with node in general
    if (err) {
      console.log(
        chalk.red(
          `Something Went Wrong. Error Message: ${chalk.red("err.message")}`
        )
      );
      process.exit(0);
    }

    // if anything goes wrong with `mongo` application installed inside the user's system
    if (stderr) {
      console.log(
        chalk.red(
          `Looks like you don't have mongo installed. Or it is not in PATH variable. Or it is not enabled. Error Message: \n${stderr}`
        )
      );

      // if (platform === "win64") {
      //   execSync("mongod.exe");
      // } else {
      //   console.log("Password is needed for starting mongodb daemon");
      //   execSync("sudo systemctl start mongodb");
      // }

      process.exit(0);
    }

    // the command output
    console.log("\n\n" + chalk.bold(stdout.split("\n")[0]));
    console.log(
      `Database Name: ${chalk.bold("tms")}\n\nwaiting for 5 seconds...`
    );

    await waitFor(1000 * 5);
    runMongoCMDs();

    console.log(
      chalk.bold(
        "\n\nAutomatic database setup is done. If you face any \nissues, you must run commands manually.\nRefer to readme for more details"
      )
    );
  });
}

/** Pause script for `t` seconds */
function waitFor(t) {
  return new Promise(resolve => {
    setTimeout(() => resolve("waited for ", t), t);
  });
}


// Run init function
__init__();
