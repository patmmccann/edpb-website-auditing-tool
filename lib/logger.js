/**
 * SPDX-FileCopyrightText: 2019 European Data Protection Supervisor
 *
 * SPDX-License-Identifier: EUPL-1.2
 * @file Setup logger
 * @author Robert Riemann <robert.riemann@edps.europa.eu>
 */

// jshint esversion: 8

const path = require("path");
const tmp = require("tmp");
tmp.setGracefulCleanup();

// Levels:
// {
//   error: 0,
//   warn: 1,
//   info: 2,
//   verbose: 3,
//   debug: 4,
//   silly: 5
// }

// https://stackoverflow.com/a/45211015/1407622
const { createLogger, format, transports } = require("winston");

const create = function (options, args = {}) {
  const defaults = {
    console: {
      silent: false,
      level: "debug",
      stderrLevels: ['error', 'debug', 'info', 'warn'],
      format: process.stdout.isTTY ? format.combine(format.colorize(), format.simple()) : format.json(),
    },

    file: {
      enabled: true,
      level: "silly",
      format: format.json(),
    },
  };

  const config = { ...defaults, ...options };

  const logger = createLogger({
    // https://stackoverflow.com/a/48573091/1407622
    format: format.combine(format.timestamp()),
    transports: [
      new transports.Console({
        level: config.console.level,
        silent: config.console.silent,
        stderrLevels: config.console.stderrLevels,
        format: config.console.format,
      }),
    ],
  });

  if (config.file.enabled) {
    let filename;
    if (args.output) {
      filename = path.join(args.output, "inspection-log.ndjson");
    } else {
      filename = tmp.tmpNameSync({ postfix: "-log.ndjson" });
    }
    logger.add(
      new transports.File({
        filename: filename,
        level: config.file.level, // log everything to file
        format: config.file.format,
      })
    );
  }

  return logger;
};

const waitForComplete = async function (logger) {
  return new Promise(async function (resolve, reject) {
    logger.log("info", "ending", { type: "logger"});
    async function waitForLogger(){
      let event_end_data = await new Promise((resolve, reject) => {
        logger.query(
          {
            start: 0,
            order: "desc",
            limit: Infinity,
          },
          (err, results) => {
            console.log("error with logger")
            if (err) return reject(err);
            return resolve(results.file);
          }
        );
      });
      const end_event = event_end_data.filter((event) => 
        event.level == 'info' && event.message == 'ending'
      )
      if (end_event.length >0){
        resolve()
      }else{
        setTimeout(waitForLogger, 100);
      } 
    }

    setTimeout(waitForLogger, 100);
  });
}

module.exports = { create, waitForComplete };
