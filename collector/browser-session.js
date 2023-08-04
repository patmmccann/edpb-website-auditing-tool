/**
 * SPDX-FileCopyrightText: 2019 European Data Protection Supervisor
 *
 * SPDX-License-Identifier: EUPL-1.2
 * @author Robert Riemann <robert.riemann@edps.europa.eu>
 */

// jshint esversion: 8

const { BrowserView, ipcMain } = require('electron');
const path = require("path");
const url = require("url");
const escapeRegExp = require("lodash/escapeRegExp");
const got = require("got");
const sampleSize = require("lodash/sampleSize");
const defaultPath = require("tough-cookie").defaultPath;

const { setup_cookie_recording, report_event_logger } = require("../lib/setup-cookie-recording");
const { setup_beacon_recording } = require("../lib/setup-beacon-recording");
const {
  setup_websocket_recording,
} = require("../lib/setup-websocket-recording");

const { set_cookies } = require("../lib/set-cookies");
const {
  isFirstParty,
  getLocalStorage,
  safeJSONParse,
} = require("../lib/tools");

async function createBrowserSession(mainWindow, partition, collector) {
  let page, hosts, har, webSocketLog, browser_context;

  let browser = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      partition: partition
    }
  });
  //browser.webContents.openDevTools();
  browser.webContents.send('init', partition);

  if (collector.args.useragent) {
    browser.webContents.setUserAgent(collector.args.useragent);
  }

  collector.refs_regexp = null;

  browser.webContents.on('did-start-loading', () => {
    mainWindow.webContents.send('browser-event', 'did-start-loading', partition);
  });

  browser.webContents.on('dom-ready', () => {
    browser.webContents.send('init', partition);
  });


  browser.webContents.on('did-finish-load', () => {
    // configuring url and hosts
    collector.output.uri_ins = browser.webContents.getURL();
    collector.output.uri_ins_host = url.parse( collector.output.uri_ins).hostname; // hostname does not include port unlike host
    collector.output.uri_refs.push( collector.output.uri_ins);

    // create url map and regex - urls.js ?
    let uri_refs_stripped =  collector.output.uri_refs.map((uri_ref) => {
      let uri_ref_parsed = url.parse(uri_ref);
      return escapeRegExp(
        `${uri_ref_parsed.hostname}${uri_ref_parsed.pathname.replace(
          /\/$/,
          ""
        )}`
      );
    });

    collector.refs_regexp = new RegExp(`^(${uri_refs_stripped.join("|")})\\b`, "i");
    mainWindow.webContents.send('browser-event', 'did-finish-load', partition);
  });

  // go to page, start har etc
  async function start() {


    // load the page to traverse
    //page = (await browser.pages())[0];
    //browser_context = await browser.new .createIncognitoBrowserContext();
    //page = await browser_context.newPage();

    // TODO : DNT
    if (collector.args.dntJs) {
      collector.args.dnt = true; // imply Do-Not-Track HTTP Header
    }

    if (collector.args.dnt) {
      browser.webContents.session.webRequest.onBeforeSendHeaders(
        (details, callback) => {
          details.requestHeaders['DNT'] = '1';
          callback({ requestHeaders: details.requestHeaders });
        });


      // do not use by default, as it is not implemented by all major browsers,
      // see: https://caniuse.com/#feat=do-not-track
      if (args.dntJs) {
        browser.webContents.send('dntJs');
      }
    }

    ipcMain.handle('reportEvent' + partition, async (reportEvent, type, stack, data, location) => {
      report_event_logger(collector.logger, type, stack, data, JSON.parse(location));
    });



    // forward logs from the browser console
    browser.webContents.on("console-message", (event, level, msg, line, sourceId) =>
      collector.logger.log("debug", msg, { type: "Browser.Console" })
    );

    hosts = {
      requests: {
        firstParty: new Set(),
        thirdParty: new Set(),
      },
      beacons: {
        firstParty: new Set(),
        thirdParty: new Set(),
      },
      cookies: {
        firstParty: new Set(),
        thirdParty: new Set(),
      },
      localStorage: {
        firstParty: new Set(),
        thirdParty: new Set(),
      },
      links: {
        firstParty: new Set(),
        thirdParty: new Set(),
      },
    };

    // forward logs from each requests browser console
    browser.webContents.session.webRequest.onBeforeRequest(async (details, callback) => {
      // record all requested hosts
      const l = url.parse(details.url);
      // note that hosts may appear as first and third party depending on the path
      if (isFirstParty(collector.refs_regexp, l)) {
        collector.pageSession.hosts.requests.firstParty.add(l.hostname);
      } else {
        if (l.protocol != "data:") {
          collector.pageSession.hosts.requests.thirdParty.add(l.hostname);
        }
      }

      await setup_beacon_recording(details, collector.logger);
      callback({});
    });

    // setup tracking
    browser.webContents.session.webRequest.onHeadersReceived(async (details, callback) => {
      await setup_cookie_recording(details, browser.webContents.mainFrame.url, collector.logger);
      callback({});
    });

    webSocketLog = setup_websocket_recording(browser.webContents, collector);



    // set predefined cookies if any
    set_cookies(page,  collector.output.uri_ins, collector.args, collector.output, collector);

    /*har = new PuppeteerHar(page);

    await har.start({
      path: args.output ? path.join(args.output, "requests.har") : undefined,
    });*/

    async function gotoPage(u) {
      collector.logger.log("info", `browsing now to ${u}`, { type: "Browser" });

      try {
        await browser.webContents.loadURL(u);
      } catch (error) {
        collector.logger.log("error", error.message, { type: "Browser" });
      }

    }

    async function browseSamples(
      webContents,
      localStorage,
      root_uri,
      firstPartyLinks,
      userSet
    ) {
      let browse_links = sampleSize(firstPartyLinks, args.max - userSet.length - 1);

      let browsing_history = [root_uri].concat(
        userSet,
        browse_links.map((l) => l.href)
      );

      for (const link of browsing_history.slice(1)) {
        try {
          // check mime-type and skip if not html
          const head = await got(link, {
            method: "HEAD",
            // ignore Error: unable to verify the first certificate (https://stackoverflow.com/a/36194483)
            // certificate errors should be checked in the context of the browsing and not during the mime-type check
            https: {
              rejectUnauthorized: false,
            },
          });

          if (!head.headers["content-type"].startsWith("text/html")) {
            collector.logger.log(
              "info",
              `skipping now ${link} of mime-type ${head["content-type"]}`,
              { type: "Browser" }
            );
            continue;
          }

          collector.logger.log("info", `browsing now to ${link}`, { type: "Browser" });

          await webContents.loadURL(link);
        } catch (error) {
          collector.logger.log("warn", error.message, { type: "Browser" });
          continue;
        }

        localStorage = await getLocalStorage(webContents, browser, localStorage);
      }

      return browsing_history;
    }

    async function screenshot() {
      const image = await (await browser.webContents.capturePage()).toPNG();
      return image;
    }

    return {
      browser,
      //session,
      page,
      har,
      hosts,
      webSocketLog,
      gotoPage,
      screenshot,
      browseSamples,
    };
  }

  // close and destroy
  async function end() {
    /*if (har) {
      await har.stop();
    }*/
    browser.webContents.session.webRequest.onBeforeRequest(null, null);
    browser.webContents.session.webRequest.onHeadersReceived(null, null);
    browser.webContents.destroy();
    ipcMain.removeHandler('reportEvent' + partition);
  }

  return { browser, page, har, hosts, start, end };
}

async function createHarSession(har, logger, output) {
  let hosts = {
    requests: {
      firstParty: new Set(),
      thirdParty: new Set(),
    },
    beacons: {
      firstParty: new Set(),
      thirdParty: new Set(),
    },
    cookies: {
      firstParty: new Set(),
      thirdParty: new Set(),
    },
    localStorage: {
      firstParty: new Set(),
      thirdParty: new Set(),
    },
    links: {
      firstParty: new Set(),
      thirdParty: new Set(),
    },
  };

  let cookies = [];
  let refs_regexp = null;

  for (let page of har.log.pages) {
    collector.output.uri_refs.push(page.title);
  }

  for (let entry of har.log.entries) {
    const page = har.log.pages.filter(page => page.id == entry.pageref)[0];

    const details = {};
    details.url = entry.request.url;
    details.title = page ? page.title : "";
    
    
    details.responseHeaders = entry.response.headers.reduce(function (map, obj) {
      map[obj.name] = [obj.value];
      return map;
    }, {});


    details.resourceType = entry._resourceType;
    details.timestamp = entry.time;
    details.frame = entry._initiator;

    // configuring url and hosts
    collector.output.uri_ins = details.url;
    collector.output.uri_ins_host = url.parse(output.uri_ins).hostname; // hostname does not include port unlike host

    // create url map and regex - urls.js ?
    let uri_refs_stripped =  collector.output.uri_refs.map((uri_ref) => {
      let uri_ref_parsed = url.parse(uri_ref);
      return escapeRegExp(
        `${uri_ref_parsed.hostname}${uri_ref_parsed.pathname.replace(
          /\/$/,
          ""
        )}`
      );
    });

    refs_regexp = new RegExp(`^(${uri_refs_stripped.join("|")})\\b`, "i");


    await setup_cookie_recording(details, details.title, logger);

    if (entry.request.cookies){
      entry.request.cookies.forEach(el => {
        if (!cookies.some(cookie=> cookie.domain == el.domain && cookie.name == el.name))
          cookies.push(el);
      });
    }
    

    // record all requested hosts
    const l = url.parse(details.url);
    // note that hosts may appear as first and third party depending on the path
    if (isFirstParty(refs_regexp, l)) {
      hosts.requests.firstParty.add(l.hostname);
    } else {
      if (l.protocol != "data:") {
        hosts.requests.thirdParty.add(l.hostname);
      }
    }

    await setup_beacon_recording(details, logger);
  }
  
  const browser = {};
  browser.cookies = cookies;
  browser.refs_regexp = refs_regexp;
  browser.logger = logger;
  return {har, hosts, browser};
}


module.exports = { createBrowserSession, createHarSession };
