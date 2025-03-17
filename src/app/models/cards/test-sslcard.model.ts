/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";
import { Details } from "../details.model";

export class ProtocolLine extends Details{
    id:string;
    finding:string;
    severity:string;

    constructor(id:string, finding:string, severity:string, idx:number){
        super('protocol', idx);
        this.id = id;
        this.finding = finding;
        this.severity = severity;
    }
}

export class VulnerabilityLine extends Details{
    id:string="";
    finding:string="";
    severity:string="";
    cve:string=""

    constructor(id:string, finding:string, severity:string, cve:string, idx : number){
        super('vulnerability', idx);
        this.id = id;
        this.finding = finding;
        this.severity = severity;
        this.cve = cve;
    }
}

export class TestSSLCard extends Card{
    protocols : ProtocolLine[] = [];
    vulnerabilities : VulnerabilityLine[] = [];
    launched : boolean = false;
    testSSLError: string | null = null;
    testSSLErrorOutput: string | null = null;
    
    constructor(testssl_result:any, testSSLError:string | null, testSSLErrorOutput:string|null){
        super("TestSSL Scan", "testSSL");
        
        if (testssl_result && testssl_result.scanResult && testssl_result.scanResult[0]){
            testssl_result.scanResult[0].protocols.forEach((protocol:any, idx:number) => {
                this.protocols.push(new ProtocolLine(protocol.id, protocol.finding, protocol.severity, idx));
            });

            testssl_result.scanResult[0].vulnerabilities.forEach((vulnerability:any, idx:number) => {
                this.vulnerabilities.push(new VulnerabilityLine(vulnerability.id, vulnerability.finding, vulnerability.severity, vulnerability.cve, idx));
            });
        }
        this.testSSLError = testSSLError;
        this.testSSLErrorOutput = testSSLErrorOutput;
    }
}
