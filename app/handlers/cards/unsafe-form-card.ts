import { CollectorSession } from "../sessions/collector-session";
import { Card } from "./card";

export class UnsafeFormCard extends Card {
    override enable() {
        throw new Error("Method not implemented.");
    }
    override disable() {
        throw new Error("Method not implemented.");
    }
    override async inspect() {
        if (this.contents && this.contents.getURL() != '') {
            try {
              return await this.contents.executeJavaScript(`
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
            } catch (error:any) {
              // ignore error if no localStorage for given origin can be
              // returned, see also: https://stackoverflow.com/q/62356783/1407622
              this.logger.log("warn", error.message, { type: "Browser" });
            }
        
          }
          return [];
    }

    constructor(collector: CollectorSession) {
        super("unsafe-form-card", collector);
    }
}