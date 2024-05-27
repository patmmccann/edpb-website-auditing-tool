/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
import { Card } from "../card.model";

export class ScreenshotCard extends Card{
    public image : Blob = new Blob();
    
    constructor(name:string){
        super(name, "image");
    }

    static blobToBase64(blob:Blob) {
        return new Promise((resolve, _) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
    }

    static async base64toBlob(base64:string) {
        const base64Response = await fetch(base64);
        return await base64Response.blob();
    }
}
