/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */

export type TemplateType = 'template' | 'annex';

export class Template {
    public id: number =0;
    public name: string = "";
    public author: string = "";
    public pug: string = "";
    public html: string = "";
    public type : TemplateType = 'template';
    public created_at: Date = new Date();
    public updated_at: Date = new Date();
}
