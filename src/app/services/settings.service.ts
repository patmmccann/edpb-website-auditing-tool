import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  detaultUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36";

  test_ssl_location :string | null =null;
  dnt :boolean =false;
  testssl :boolean =false;
  cookies :boolean =false;
  localstorage :boolean =false;
  https :boolean =false;
  traffic :boolean =false;
  webform :boolean =false;
  beacons :boolean =false;
  useragent:string = "";
  help:boolean = false;

  constructor() { 
    const setAgent = localStorage.getItem('useragent');
    this.useragent = setAgent == null || setAgent == "" ? this.detaultUserAgent  : setAgent;
    this.test_ssl_location = localStorage.getItem('test_ssl_location');
    this.dnt = localStorage.getItem('DNT') == 'true'? true : false ;
    this.testssl = localStorage.getItem('testssl') == 'true'? true : false ;
    this.cookies = localStorage.getItem('cookies') == 'false'? false : true ;
    this.localstorage = localStorage.getItem('localstorage') == 'false'?false : true ;
    this.https = localStorage.getItem('https') == 'false'? false : true ;
    this.traffic = localStorage.getItem('traffic') == 'false'? false : true ;
    this.webform = localStorage.getItem('webform') == 'false'? false : true ;
    this.beacons = localStorage.getItem('beacons') == 'false'? false : true ;
    this.help = localStorage.getItem('help') == 'false'? false : true ;
  }

  setTestSSLLocation(location:string){
    this.test_ssl_location = location;
    localStorage.setItem('test_ssl_location', location);
  }

  setItem(key :string, value:any):void{
    localStorage.setItem(key, value);
  }

  setUsageAgent(event:any){
    if (event){
      localStorage.setItem('useragent', event.value);
    }
  }

  toArgs():any{
    let args:any = {};
    args.dnt = this.dnt ;
    args.testssl = this.testssl ;
    args.useragent = this.useragent
    if (args.testssl){
      args.testsslExecutable = this.test_ssl_location;
    }
    return args;
  }
}
