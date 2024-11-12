/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
export class Stack {
    public columnNumber: number =0;
    public fileName: string ="";
    public lineNumber: number =0;
    public source: string="";
    public functionName:string | null= null;
    public request: any= null;

    constructor(stack:any){
        this.columnNumber= stack.columnNumber;
        this.fileName= stack.fileName;
        this.lineNumber= stack.lineNumber;
        this.functionName = stack.functionName;
        this.request = stack.request;
        this.source= stack.source;
    }
}
