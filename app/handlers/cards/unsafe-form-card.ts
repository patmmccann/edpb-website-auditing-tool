/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 * 
 * Based on https://github.com/EU-EDPS/website-evidence-collector/blob/master/collector/index.js
 * from the Website Evidence Collector (https://github.com/EU-EDPS/website-evidence-collector)
 * 
 */
import { Collector } from "../collectors/collector";
import { Card } from "./card";

export class UnsafeFormCard extends Card {
  _callback = null;
  _unsafe_form = [];

  override enable() {
    this._callback = this.unsafeWebforms.bind(this);
    this.collector.domReadyCallbacks.push(this._callback);
  }
  override disable() {
    const index = this.collector.domReadyCallbacks.indexOf(this._callback);
    this.collector.onBeforeRequestCallbacks.splice(index, 1);
    this._callback = null;
  }

  async unsafeWebforms() {
    const data = [];

    let allframes = [];
    try {
      allframes = this.contents.mainFrame.framesInSubtree;
    } catch (error: any) {
      // ignore error if no localStorage for given origin can be
      // returned, see also: https://stackoverflow.com/q/62356783/1407622
      if (this.logger.writable == false) return;
      this.logger.log("warn", error.message, { type: "Browser" });
      return data;
    }
    for (const frame of allframes) {
      try {
        if (!frame.url.startsWith("http")) {
          continue; // filters chrome-error://, about:blank and empty url
        }

        const form = await frame.executeJavaScript(`
                [].map
                  .call(Array.from(document.querySelectorAll("form")), (form) => {
                    return {
                      id: form.id,
                      action: new URL(form.getAttribute("action"), form.baseURI).toString(),
                      method: form.method,
                    };
                  })
                  .filter((form) => {
                    return form.action.startsWith("http:");
                  });`);
        if (form.length > 0) {
          data.push(...form);
        }
      } catch (error: any) {
        // ignore error if no localStorage for given origin can be
        // returned, see also: https://stackoverflow.com/q/62356783/1407622
        if (this.logger.writable == true)
        this.logger.log("warn", error.message, { type: "unsafe-form-card" });
      }
    }

    this._unsafe_form = data;
  }

  override clear() {
    this._unsafe_form = [];
  }

  override inspect(output) {
    output.unsafeForms = this._unsafe_form;
  }

  constructor(collector: Collector) {
    super("forms", collector);
  }
}