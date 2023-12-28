import { Collector } from "../collectors/collector";
import { Card } from "./card";

export class UnsafeFormCard extends Card {
  override enable() {
    throw new Error("Method not implemented.");
  }
  override disable() {
    throw new Error("Method not implemented.");
  }
  override async inspect() {
    const data = [];

    if (this.contents && this.contents.getURL() != '') {
      let allframes;
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
          if (form.length>0){
            data.push(...form);
          }
        } catch (error: any) {
          // ignore error if no localStorage for given origin can be
          // returned, see also: https://stackoverflow.com/q/62356783/1407622
          if (this.logger.writable == false) return;
          this.logger.log("warn", error.message, { type: "Browser" });
        }
      }
    }
    return data;
  }

  constructor(collector: Collector) {
    super("unsafe-form-card", collector);
  }
}