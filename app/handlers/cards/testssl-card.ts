import { Collector } from "../collectors/collector";
import { Card } from "./card";


import * as url from 'url';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export class TestSSLCard extends Card {
    _testSSLError = null;
    _testSSLErrorOutput = null;
    _testSSLErrorCode = null;
    _testSSL = null;

    testSSLScript(uri, settings, logger) {
        return new Promise((resolve, reject) => {
    
            let uri_ins_https = new url.URL(uri);
            uri_ins_https.protocol = "https:";
    
            let testsslExecutable = settings.test_ssl_location || "testssl.sh"; // set default location
            let testsslArgs = [
                "--ip one", // speed up testssl: just test the first DNS returns (useful for multiple IPs)
                "--quiet", // no banner
                "--hints", // additional hints to findings
                //"--fast", // omits some checks: using openssl for all ciphers (-e), show only first preferred cipher.
                "--vulnerable", // tests vulnerabilities (if applicable)
                "--headers", // tests HSTS, HPKP, server/app banner, security headers, cookie, reverse proxy, IPv4 address
                "--protocols", // checks TLS/SSL protocols (including SPDY/HTTP2)
                "--standard", // tests certain lists of cipher suites by strength
                "--server-defaults", // displays the server's default picks and certificate info
                "--server-preference", // displays the server's picks: protocol+cipher
            ];
    
            let json_file;
    
            // case with --no-ouput and --testssl
            json_file = path.join(os.tmpdir(), `testssl.${Date.now()}.json`);
    
            testsslArgs.push(`--jsonfile-pretty ${json_file}`);
            testsslArgs.push(uri_ins_https.toString());
    
            const { exec } = require("child_process");
    
            let cmd = `${testsslExecutable} ${testsslArgs.join(" ")}`;
            logger.log("info", `launching testSSL: ${cmd}`, { type: "testSSL" });
            exec(cmd, (e, stdout, stderr) => {
                if (e) {
                    this._testSSLErrorCode = e.status;
                    // https://github.com/drwetter/testssl.sh/blob/3.1dev/doc/testssl.1.md#exit-status
                    logger.log("warn", e.message.toString(), { type: "testSSL" });
                    this._testSSLError = e.message.toString();
                    if (stderr) {
                        this._testSSLErrorOutput = stderr.toString();
                    }
                } else {
                    this._testSSLErrorCode = null;
                    this._testSSLErrorOutput = null;
                }
    
                if (fs.existsSync(json_file)) {
                    resolve(JSON.parse(fs.readFileSync(json_file, "utf8")));
                } else {
                    this._testSSLError = "No result found for testssl";
                    this._testSSLErrorOutput = "Verify your testssl.sh location";
                    resolve(null);
                }
    
                if (!settings.output) {
                    fs.removeSync(json_file);
                }
            });
        });
    }

    testSSLDocker(uri, settings, logger) {
        return new Promise((resolve, reject) => {
            let uri_ins_https = new url.URL(uri);
            uri_ins_https.protocol = "https:";

        
          let testsslExecutable = `docker run -v ${os.tmpdir()}:/res --rm -t drwetter/testssl.sh:3.0`;
          let testsslArgs = [
            "--ip one", // speed up testssl: just test the first DNS returns (useful for multiple IPs)
            "--quiet", // no banner
            "--hints", // additional hints to findings
            //"--fast", // omits some checks: using openssl for all ciphers (-e), show only first preferred cipher.
            "--vulnerable", // tests vulnerabilities (if applicable)
            "--headers", // tests HSTS, HPKP, server/app banner, security headers, cookie, reverse proxy, IPv4 address
            "--protocols", // checks TLS/SSL protocols (including SPDY/HTTP2)
            "--standard", // tests certain lists of cipher suites by strength
            "--server-defaults", // displays the server's default picks and certificate info
            "--server-preference", // displays the server's picks: protocol+cipher
          ];

          const json_file = `testssl.${Date.now()}.json`;;

          testsslArgs.push(`--jsonfile-pretty /res/${json_file}`);
          testsslArgs.push(uri_ins_https.toString());

          const { exec } = require("child_process");
      
          let cmd = `${testsslExecutable} ${testsslArgs.join(" ")}`;
          logger.log("info", `launching testSSL: ${cmd}`, { type: "testSSL" });
          exec(cmd, (e, stdout, stderr) => {
            if (e) {
                this._testSSLErrorCode = e.status;
                // https://github.com/drwetter/testssl.sh/blob/3.1dev/doc/testssl.1.md#exit-status
                logger.log("warn", e.message.toString(), { type: "testSSL" });
                this._testSSLError = e.message.toString();
                if (stderr){
                    this._testSSLErrorOutput = stderr.toString();
                }
                resolve(null);
                return;
            }else{
              this._testSSLErrorCode = null;
              this._testSSLErrorOutput = null;
            }
            const res_file = path.join(os.tmpdir(), json_file);
            if (fs.existsSync(res_file)) {
              resolve(JSON.parse(fs.readFileSync(res_file, "utf8")));
            }else{
              this._testSSLError = "No result found for testssl";
              this._testSSLErrorOutput = "Verify your docker installation";
              resolve(null);
            }
      
            if (!settings.output) {
              fs.removeSync(res_file);
            }
          });
        });
      }

    enable() {
        //throw new Error('Method not implemented.');
    }
    disable() {
        //throw new Error('Method not implemented.');
    }

    constructor(collector: Collector) {
        super("testSSL", collector);
    }

    override clear() {
        throw new Error('Method not implemented.');
    }

    override async launch(){
        if (!this.collector.contents.getURL()) {
            this._testSSLError = "No url given to test_ssl.sh";
            return;
        }

        switch (this.collector.settings.testssl_type) {
            case 'script':
                this._testSSL = await this.testSSLScript(this.collector.contents.getURL(), this.collector.settings, this.collector.logger)
                break;
            case 'docker':
                this._testSSL = await this.testSSLDocker(this.collector.contents.getURL(), this.collector.settings, this.collector.logger)
                break;

            default:
                this._testSSLError = "Unknow method for testssl, go to settings first.";
        }
    }
    
    async inspect(output) {
        output.testSSL = this.testSSL;
        output.testSSLError = this.testSSLError;
        output.testSSLErrorOutput = this.testSSLErrorOutput;
        output.testSSLErrorCode = this.testSSLErrorCode;
    }

    get testSSLError() {
        return this._testSSLError;
    }

    get testSSLErrorOutput() {
        return this._testSSLErrorOutput;
    }

    get testSSLErrorCode() {
        return this._testSSLErrorCode;
    }

    get testSSL(){
        return this._testSSL;
    }
}