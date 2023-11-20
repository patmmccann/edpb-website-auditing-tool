/**
 * SPDX-FileCopyrightText: 2019 European Data Protection Supervisor
 *
 * SPDX-License-Identifier: EUPL-1.2
 * @file inspector
 * @author Robert Riemann <robert.riemann@edps.europa.eu>
 */


// jshint esversion: 8

const groupBy = require("lodash/groupBy");
const flatten = require("lodash/flatten");
const url = require("url");

const {
  isFirstParty,
  getLocalStorage,
  safeJSONParse,
} = require("../lib/tools");

async function inspector(args, logger, pageSession, output) {
  const c = {
    eventData: null,
    logger: logger,
    args: args,
    output: output,
    pageSession: pageSession,
  };

  let event_data_all = await new Promise((resolve, reject) => {
    logger.query(
      {
        start: 0,
        order: "desc",
        limit: Infinity,
      },
      (err, results) => {
        if (err) return reject(err);
        return resolve(results.file);
      }
    );
  });

  // filter only events with type set
  c.eventData = event_data_all.filter((event) => {
    return !!event.type;
  });

  c.inspectCookies = async function (tmp_collector, new_collector) {
    // we get all cookies from the log, which can be both JS and http cookies
    let cookies_from_events = flatten(
      c.eventData
        .filter((event) => {
          return event.type.startsWith("Cookie");
        })
        .map((event) => {
          event.data.forEach((cookie) => {
            cookie.log = {
              stack: event.stack,
              type: event.type,
              timestamp: event.timestamp,
              location: event.location,
            };
          });
          return event.data;
        })
    ).filter(cookie => cookie.value); // don't consider deletion events with no value defined

    cookies_from_events.forEach((event_cookie) => {
      // we compare the eventlog with what was collected
      let matched_cookie = c.output.cookies.find((cookie) => {
        return (
          cookie.name == event_cookie.key &&
          cookie.domain == event_cookie.domain &&
          cookie.path == event_cookie.path
        );
      });

      // if there is a match, we enrich with the log entry
      // else we add a nww entry to the output.cookies array
      if (matched_cookie) {
        matched_cookie.log = event_cookie.log;
      } else {
        let cookie = {
          name: event_cookie.key,
          domain: event_cookie.domain,
          path: event_cookie.path,
          value: event_cookie.value,
          expires: event_cookie.expires,
          log: event_cookie.log,
        };
        if(!event_cookie.expires) {
          cookie.expires = -1;
          cookie.session = true;
        } else {
          cookie.expiresDays = Math.round((new Date(event_cookie.expires).getTime() - new Date(event_cookie.creation).getTime()) / (10 * 60 * 60 * 24)) / 100;
          cookie.session = false;
        }
        c.output.cookies.push(cookie);
      }
    });

    c.output.cookies.forEach((cookie) => {
      // after the sync, we determine if its first party or 3rd
      // if a domain is empty, its a JS cookie setup as first party
      if (
        isFirstParty(
          tmp_collector.refs_regexp,
          `cookie://${cookie.domain}${cookie.path}`
        ) ||
        cookie.domain === ""
      ) {
        cookie.firstPartyStorage = true;
        new_collector.hosts.cookies.firstParty.add(cookie.domain);
      } else {
        cookie.firstPartyStorage = false;
        new_collector.hosts.cookies.thirdParty.add(cookie.domain);
      }
    });

    // finally we sort the cookies based on expire data - because ?
    c.output.cookies = c.output.cookies.sort(function (a, b) {
      return b.expires - a.expires;
    });
  };

  c.inspectLocalStorage = async function (local_storage, tmp_collector, new_collector) {
    let storage_from_events = c.eventData.filter((event) => {
      return event.type.startsWith("Storage");
    });

    Object.keys(local_storage).forEach((origin) => {
      let hostname = new url.URL(origin).hostname;
      let isFirstPartyStorage = isFirstParty(tmp_collector.refs_regexp, origin);

      if (isFirstPartyStorage) {
        new_collector.hosts.localStorage.firstParty.add(hostname);
      } else {
        new_collector.hosts.localStorage.thirdParty.add(hostname);
      }

      //
      let originStorage = local_storage[origin];
      Object.keys(originStorage).forEach((key) => {
        // add if entry is linked to first-party host
        originStorage[key].firstPartyStorage = isFirstPartyStorage;
        // find log for a given key
        let matched_event = storage_from_events.find((event) => {
          return (
            origin == event.origin && Object.keys(event.data).includes(key)
          );
        });

        if (!!matched_event) {
          originStorage[key].log = {
            stack: matched_event.stack,
            type: matched_event.type,
            timestamp: matched_event.timestamp,
            location: matched_event.location,
          };
        }
      });
    });
  };

  c.inspectBeacons = async function (collector, tmp_collector) {
    let beacons_from_events = flatten(
      c.eventData
        .filter((event) => {
          return event.type.startsWith("Request.Tracking");
        })
        .map((event) => {
          return Object.assign({}, event.data, {
            log: {
              stacks: event.stack,
              // type: event.type,
              timestamp: event.timestamp,
            },
          });
        })
    );

    for (const beacon of beacons_from_events) {
      const l = url.parse(beacon.url);

      if (beacon.listName == "easyprivacy.txt") {
        if (isFirstParty(tmp_collector.refs_regexp, l)) {
          collector.hosts.beacons.firstParty.add(l.hostname);
        } else {
          collector.hosts.beacons.thirdParty.add(l.hostname);
        }
      }
    }

    // make now a summary for the beacons (one of every hostname+pathname and their occurrance)
    let beacons_from_events_grouped = groupBy(beacons_from_events, (beacon) => {
      let url_parsed = url.parse(beacon.url);
      return `${url_parsed.hostname}${url_parsed.pathname.replace(/\/$/, "")}`;
    });

    let beacons_summary = [];
    for (const [key, beacon_group] of Object.entries(
      beacons_from_events_grouped
    )) {
      beacons_summary.push(
        Object.assign({}, beacon_group[0], {
          occurrances: beacon_group.length,
        })
      );
    }

    beacons_summary.sort((b1, b2) => {
      return b2.occurances - b1.occurances;
    });

    c.output.beacons = beacons_summary;
  };

  c.inspectHosts = async function (new_collector) {
    // Hosts Inspection
    let arrayFromParties = function (array) {
      return {
        firstParty: Array.from(array.firstParty),
        thirdParty: Array.from(array.thirdParty),
      };
    };

    c.output.hosts = {
      requests: arrayFromParties(new_collector.hosts.requests),
      beacons: arrayFromParties(new_collector.hosts.beacons),
      cookies: arrayFromParties(new_collector.hosts.cookies),
      localStorage: arrayFromParties(new_collector.hosts.localStorage),
      links: arrayFromParties(new_collector.hosts.links),
    };
  };

  return c;
}

module.exports = inspector;
