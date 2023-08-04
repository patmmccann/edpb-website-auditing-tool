/**
 * SPDX-FileCopyrightText: 2019 European Data Protection Supervisor
 *
 * SPDX-License-Identifier: EUPL-1.2
 * @author Robert Riemann <robert.riemann@edps.europa.eu>
 */

const pickBy = require("lodash/pickBy");
const escapeRegExp = require("lodash/escapeRegExp");

const { safeJSONParse } = require("../lib/tools");
const os = require("os");
const url = require("url");
const { gitDescribeSync } = require("git-describe");

async function createOutput(args) {
  let uri_ins = null;
  let uri_ins_host = null;
  let uri_refs = [];

  if (args.url) {
    // configuring url and hosts
    uri_ins = args.url;
    uri_ins_host = url.parse(uri_ins).hostname; // hostname does not include port unlike host

    if (args.firstPartyUri){
      uri_refs = [uri_ins].concat(args.firstPartyUri);
    }
  }


  // prepare hash to store data for output output.js
  const output = {
    title: args.title || `Website Evidence Collection`,
    task_description: safeJSONParse(args.taskDescription),
    uri_ins: uri_ins,
    uri_refs: uri_refs,
    uri_dest: null,
    uri_redirects: null,
    secure_connection: null,
    testSSLError: null,
    testSSLErrorOutput: null,
    testSSLErrorCode: null,
    testSSL: null,

    host: uri_ins_host,
    script: {
      host: os.hostname(),
      version: {
        npm: require("../package.json").version,
        commit: null,
      },
      config: pickBy(args, (_value, key) => key === '_' || (key.length > 1 && !key.includes('-'))),
      cmd_args: process.argv.slice(2).join(" "),
      environment: pickBy(process.env, (_value, key) => {
        return (
          key.startsWith("WEC") ||
          key.startsWith("PUPPETEER") ||
          key.startsWith("CHROM")
        );
      }),
      node_version: process.version,
    },
    localStorage: null,
    cookies: [],
    beacons: [],
    links: {
      firstParty: [],
      thirdParty: [],
      social: [],
      keywords: [],
    },
    unsafeForms: null,
    browser: {
      name: "Chromium",
      version: "",
      user_agent: "",
      platform: {
        name: os.type(),
        version: os.release(),
      },
      extra_headers: { dnt: 0 },
      preset_cookies: {},
    },
    browsing_history: [],
    hosts: {},
    websockets: {},
    start_time: new Date(),
    end_time: null,
  };

  // log git version if git is installed
  try {
    const gitInfo = gitDescribeSync(__dirname);
    output.script.version.commit = gitInfo.raw;
  } catch (e) { }

  return output;
}

module.exports = { createOutput };
