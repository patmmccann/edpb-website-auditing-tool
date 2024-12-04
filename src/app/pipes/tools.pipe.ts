/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


@Pipe({
    name: 'safeHtml',
    standalone: false
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(value: string | null) {
    if (value) {
      return this.sanitized.bypassSecurityTrustHtml(value);
    }
    return "";
  }
}

@Pipe({
    name: 'safeIMG',
    standalone: false
})
export class SafeImgPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(blob: Blob) {
    let objectURL = URL.createObjectURL(blob);
    return this.sanitized.bypassSecurityTrustUrl(objectURL);
  }
}

@Pipe({
    name: 'safeURL',
    standalone: false
})
export class SafeUrl implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  isURL(input: string): boolean {
    const pattern = /^(?:\w+:)?\/\/([^\s.]+\.\S{2}|localhost[:?\d]*)\S*$/;

    if (pattern.test(input)) {
      return true;
    }
    return pattern.test(`http://${input}`);
  };

  transform(value: string) {
    if (this.isURL(value)) {
      return value.indexOf('://') === -1 ? `http://${value}` : value;
    }
    return value;
  }
}
