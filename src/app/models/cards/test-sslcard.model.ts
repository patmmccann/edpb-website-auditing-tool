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

    constructor(id:string, finding:string, severity:string){
        super('protocol');
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

    constructor(id:string, finding:string, severity:string, cve:string){
        super('vulnerability');
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
        this.is_runnable = true;
        if (testssl_result && testssl_result.scanResult && testssl_result.scanResult[0]){
            for (let protocol of testssl_result.scanResult[0].protocols){
                this.protocols.push(new ProtocolLine(protocol.id, protocol.finding, protocol.severity));
            }

            for (let vulnerability of testssl_result.scanResult[0].vulnerabilities){
                this.vulnerabilities.push(new VulnerabilityLine(vulnerability.id, vulnerability.finding, vulnerability.severity, vulnerability.cve));
            }
        }
        this.testSSLError = testSSLError;
        this.testSSLErrorOutput = testSSLErrorOutput;
    }

    override get help():string {
        return "The software TestSSL inspects the HTTPS configuration of the web service host. It classifies detected vulnerabilities by their level of severity low, medium, high, or critical."
    } 
}
