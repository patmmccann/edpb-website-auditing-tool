import { BrowserView, WebContents} from 'electron';

export class BrowserSession {
    _url = "";
    _view : BrowserView;
    _contents : WebContents;

    constructor(view : BrowserView, content : WebContents){
        this._view = view;
        this._contents = content;
    }

    async create() {

    }

    async delete() {
        
    }

    async clear() {
        
    }

    async gotoPage(url){
        await this._contents.loadURL(url);
    }

    canGoForward(){
        return this._contents.canGoForward();
    }
    
    canGoBack(){
        return this._contents.canGoBack();
    }

    goBack(){
        this._contents.goBack();
    }

    goForward(){
        this._contents.goForward();
    }

    stop(){
        this._contents.stop();
    }

    reload(){
        this._contents.reload();
    }

    url(){
        return this._contents.getURL();
    }

    async screenshot(){
        const capture = await this._contents.capturePage();
        return await capture.toPNG();

    }

    async collect(){

    }

    async save(){

    }

    get view(){
        return this._view;
    }

    get contents(){
        return this._contents;
    }
}