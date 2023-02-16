/**
 * @author Robert Riemann <robert.riemann@edps.europa.eu>
 * @copyright European Data Protection Supervisor (2019)
 * @license EUPL-1.2
 */

// jshint esversion: 8
const {app } = require('electron');

const output_lib = require("./output");
const collector_connection = require("./connection");
const collector_inspect = require("./inspector");

const browsersession = require("./browser-session");
const { isFirstParty, getLocalStorage } = require("../lib/tools");

async function collector(args, logger) {
  
  // create the output hash...
  const output = await output_lib.createOutput(args);

  const c = {
    browserSession: null,
    pageSession: null,
    logger: logger,

    args: args,
    output: output,
    source: null,
  };

  c.createSession = async function (mainWindow, partition) {
    c.browserSession = await browsersession.createBrowserSession(
      mainWindow,
      partition,
      c
    );

    c.output.browser.version = await app.getVersion();
    c.output.browser.user_agent = await c.browserSession.browser.webContents.getUserAgent();
    c.pageSession = await c.browserSession.start();
  };

  c.testConnection = async function () {
    await collector_connection.testHttps(c.output.uri_ins, c.output);
    await collector_connection.testSSL(
      c.output.uri_ins,
      c.args,
      c.logger,
      c.output
    );
  };

  c.getPage = async function (url = null) {
    if (!url) {
      url = c.output.uri_ins;
    }

    await c.pageSession.gotoPage(url);

    // log redirects TODO
    /*c.output.uri_redirects = response
      .request()
      .redirectChain()
      .map((req) => {
        return req.url();
      });*/

    // log the destination uri after redirections
    c.output.uri_dest = c.pageSession.browser.webContents.getURL();
   // c.source = await c.pageSession.browser.webContents.executeJavaScript("document.documentElement.outerHTML");
/* TODO : screenshots
    // record screenshots
    if (c.args.output && c.args.screenshots) {
      await c.pageSession.screenshot();
    }*/
  };

  c.collectLinks = async function () {
    // get all links from page
    const links = await collector_inspect.collectLinks(c.pageSession.browser.webContents);

    var mappedLinks = await collector_inspect.mapLinksToParties(
      links,
      c.pageSession.hosts,
      c.pageSession.browser.refs_regexp
    );

    c.output.links.firstParty = mappedLinks.firstParty;
    c.output.links.thirdParty = mappedLinks.thirdParty;

    c.output.links.social = await collector_inspect.filterSocialPlatforms(
      links
    );

    // prepare regexp to match links by their href or their caption
    c.output.links.keywords = await collector_inspect.filterKeywords(links);
  };

  c.collectCookies = async function () {
    const cookies = c.pageSession.browser.webContents ? await c.pageSession.browser.webContents.session.cookies.get({}) : c.pageSession.browser.cookies;
    c.output.cookies = await collector_inspect.collectCookies(
      cookies,
      c.output.start_time
    );
  };

  c.collectForms = async function () {
    // unsafe webforms
    c.output.unsafeForms = await collector_inspect.unsafeWebforms(
      c.pageSession.browser.webContents
    );
  };

  c.collectLocalStorage = async function () {
    c.output.localStorage = await getLocalStorage(c.pageSession.browser.webContents, c.logger);
  };

  c.collectWebsocketLog = async function () {
    c.output.websocketLog = c.pageSession.webSocketLog;
  };

  c.browseSamples = async function (localStorage, user_set = []) {
    c.output.browsing_history = await c.pageSession.browseSamples(
      c.pageSession.browser.webContents,
      localStorage,
      c.output.uri_dest,
      c.output.links.firstParty,
      user_set
    );
  };

  c.endSession = async function () {
    if(c.browserSession){
      await c.browserSession.end();
      c.browserSession = null;
    }
  
    c.output.end_time = new Date();
  };

  c.endPageSession = function () {
    c.pageSession = null;
  };

  c.eraseSession = async function (args, logger) {
    c.output = await output_lib.createOutput(args);
    c.output.uri_ins = c.browserSession.browser.webContents.getURL();
    c.logger = logger;
    c.pageSession.hosts = {
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

    c.browserSession.browser.webContents.session.clearCache();
    c.browserSession.browser.webContents.session.clearStorageData();
  };

  c.createSessionFromHar = async function (har) {
    c.browserSession = await browsersession.createHarSession(har, 
      c.logger,
      c.output
      );

    c.pageSession = c.browserSession;
  }
  
  return c;
}

module.exports = collector;
