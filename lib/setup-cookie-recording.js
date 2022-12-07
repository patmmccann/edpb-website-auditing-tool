const { safeJSONParse } = require("./tools");
const cookieParser = require("tough-cookie").Cookie;
const defaultPath = require("tough-cookie").defaultPath;

module.exports.report_event_logger = function (logger, type, stack, data, location) {
  // determine actual browsed page
  let browsedLocation = location.href;
  if (location.ancestorOrigins && location.ancestorOrigins[0]) {
    // apparently, this is a chrome-specific API
    browsedLocation = location.ancestorOrigins[0];
  }

  // construct the event object to log
  // include the stack
  let event = {
    type: type,
    stack: stack.slice(1, 3), // remove reference to Document.set (0) and keep two more elements (until 3)
    origin: location.origin,
    location: browsedLocation,
  };

  // set the log entry message - this depends on what type of event is being logged
  // only js cookies and localstorage events should be logged here
  let message;
  switch (type) {
    case "Cookie.JS":
      event.raw = data;
      let cookie = cookieParser.parse(data);

      // what is the domain if not set explicitly?
      // https://stackoverflow.com/a/5258477/1407622
      cookie.domain = cookie.domain || location.hostname;

      // what if the path is not set explicitly?
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
      // https://github.com/salesforce/tough-cookie#defaultpathpath
      // TODO How can be sure that browsedLocation corresponds to the JS execution context when cookie is set?
      cookie.path = cookie.path || defaultPath(url.parse(browsedLocation).pathname);

      event.data = [cookie];

      message = `${event.data[0].expires ? "Persistant" : "Session"
        } Cookie (JS) set for host ${event.data[0].domain} with key ${event.data[0].key
        }.`;
      break;

    case "Storage.LocalStorage":
      message = `LocalStorage filled with key(s) ${Object.keys(
        data
      )} for origin ${location.origin}.`;
      event.raw = data;
      event.data = {};
      for (const key of Object.keys(data)) {
        event.data[key] = safeJSONParse(data[key]);
      }
      break;

    default:
      message = "";
      event.data = data;
  }

  logger.log("warn", message, event);
}

const url = require("url");
const groupBy = require("lodash/groupBy");

module.exports.setup_cookie_recording = async function (details, main_url, logger) {
  let cookieHTTPHeader = Object.keys(details.responseHeaders).find(key => key.toLowerCase() === "set-cookie");;
  if (cookieHTTPHeader) {
    let cookieHTTP = details.responseHeaders[cookieHTTPHeader][0];
    let stack = [
      {
        fileName: details.url,
        source: `set in Set-Cookie HTTP response header for ${details.url}`,
      },
    ];
    const domain = new url.URL(details.url).hostname;
    const data = cookieHTTP
      .split("\n")
      .map((c) => {
        return cookieParser.parse(c) || { value: c };
      })
      .map((cookie) => {
        // what is the domain if not set explicitly?
        // https://stackoverflow.com/a/5258477/1407622
        cookie.domain = cookie.domain || domain;

        // what if the path is not set explicitly?
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#attributes
        // https://github.com/salesforce/tough-cookie#defaultpathpath
        cookie.path = cookie.path || defaultPath(new url.URL(details.url).pathname);
        return cookie;
      });

    const dataHasKey = groupBy(data, (cookie) => {
      return !!cookie.key;
    });
    const valid = dataHasKey[true] || [];
    const invalid = dataHasKey[false] || [];

    const messages = [
      `${valid.length} Cookie(s) (HTTP) set for host ${domain}${valid.length ? " with key(s) " : ""
      }${valid.map((c) => c.key).join(", ")}.`,
    ];
    if (invalid.length) {
      messages.push(
        `${invalid.length
        } invalid cookie header(s) set for host ${domain}: "${invalid
          .map((c) => c.value)
          .join(", ")}".`
      );
    }

    messages.forEach((message) => {
      logger.log("warn", message, {
        type: "Cookie.HTTP",
        stack: stack,
        location: main_url, // or page.url(), // (can be about:blank if the request is issued by browser.goto)
        raw: cookieHTTP,
        data: valid,
      });
    });
  }
}