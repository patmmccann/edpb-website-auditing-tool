export class Stack {
    public columnNumber: number =0;
    public fileName: string ="";
    public lineNumber: number =0;
    public source: string="";
    public functionName:string | null= null;

    constructor(stack:any){
        this.columnNumber= stack.columnNumber;
        this.fileName= stack.fileName;
        this.lineNumber= stack.lineNumber;
        this.functionName = stack.functionName;
        this.source= stack.source;
    }
}
