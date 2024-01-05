/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Stack } from "./stack.model";

export class Log {
    public stacks :Stack[] = [];
    public type:string = "";
    public timestamp:string = "";
    public location:string = "";
    
    constructor(logs:any){
        if (logs){
            this.type = logs.type;;
            this.location = logs.location;
            this.timestamp = logs.timestamp;
            if (logs.stack){
                for (const log of logs.stack){
                    const stack = new Stack(log);
                    this.stacks.push(stack);
                }
            }
        }

    }
}
