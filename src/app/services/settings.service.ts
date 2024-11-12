/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Injectable } from '@angular/core';
import { BrowserService } from './browser.service';

export type TestSLLType ='script' | 'docker';
export const allTestSLLType : TestSLLType[] = ['script' , 'docker'];
export type StorageType ='local' | 'remote';
export const allStorageType : StorageType[] = ['local' , 'remote'];

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  detaultUserAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36";

  _settings = {
    dnt : false,
    devTool : false,
    testssl : false,
    testssl_type : 'docker',
    storage_type : 'local',
    test_ssl_location : "",
    cookies : false,
    localstorage : false,
    https : false,
    traffic : false,
    webform : false,
    beacons : false,
    logs : false,
    infos:false,
    useragent:  "",
    help: false,
    server_url:"",
    client_id:"",
    client_secret:"",
    use_proxy : false,
    proxy_settings: "",
    use_doh: false,
    doh: ""
  }

  constructor(
  ) {
    const server_url = localStorage.getItem('server_url');
    const client_id = localStorage.getItem('client_id');
    const client_secret = localStorage.getItem('client_secret');

    const test_ssl_location = localStorage.getItem('test_ssl_location');
    const proxy_settings = localStorage.getItem('proxy_settings');
    const setAgent = localStorage.getItem('useragent');
    const doh = localStorage.getItem('doh')
    this._settings.useragent = setAgent == null || setAgent == "" ? this.detaultUserAgent  : setAgent;
    this._settings.dnt = localStorage.getItem('DNT') == 'true'? true : false ;
    this._settings.testssl = localStorage.getItem('testssl') == 'true'? true : false ;
    this._settings.testssl_type = localStorage.getItem('testssl_type') == 'script'? 'script' : 'docker' ;
    this._settings.storage_type = localStorage.getItem('storage_type') == 'remote'? 'remote' : 'local' ;
    this._settings.test_ssl_location = test_ssl_location? test_ssl_location : "";
    this._settings.cookies = localStorage.getItem('cookies') == 'false'? false : true ;
    this._settings.localstorage = localStorage.getItem('localstorage') == 'false'?false : true ;
    this._settings.https = localStorage.getItem('https') == 'false'? false : true ;
    this._settings.traffic = localStorage.getItem('traffic') == 'false'? false : true ;
    this._settings.webform = localStorage.getItem('webform') == 'false'? false : true ;
    this._settings.beacons = localStorage.getItem('beacons') == 'false'? false : true ;
    this._settings.logs = localStorage.getItem('logs') == 'false'? false : true ;
    this._settings.help = localStorage.getItem('help') == 'false'? false : true ;
    this._settings.devTool = localStorage.getItem('devTool') == 'true'? true : false ;
    this._settings.infos = localStorage.getItem('infos') == 'false'? false : true ;
    this._settings.server_url = server_url != null ? server_url : "";
    this._settings.client_id = client_id != null ? client_id : "";
    this._settings.client_secret = client_secret != null ? client_secret : "";
    this._settings.use_proxy = localStorage.getItem('use_proxy') == 'true'? true : false ;
    this._settings.proxy_settings = proxy_settings != null ? proxy_settings : "";
    this._settings.use_doh = localStorage.getItem('use_doh') == 'true'? true : false ;
    this._settings.doh = doh? doh : "";
  }
  setItem(key :string, value:any):void{
    localStorage.setItem(key, value);
  }

  setUserAgent(event:any){
    if (event){
      localStorage.setItem('useragent', event.value);
    }
  }

  setProxySettings(event:any){
    if (event){
      localStorage.setItem('proxy_settings', event.value);
    }
  }

  setTestSSLLocation(location:string){
    this._settings.test_ssl_location = location;
    localStorage.setItem('test_ssl_location', location);
  }

  setDoH(event:any) {
    if (event) {
      localStorage.setItem('doh', event.value);
    }
  }

  get settings(){
    return this._settings;
  }
}
