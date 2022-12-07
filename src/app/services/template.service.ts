import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationDb } from '../application.db';
import { Template } from '../models/template.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TemplateService extends ApplicationDb {
  default_pug :string= "";

  constructor(
    private httpClient: HttpClient
  ) {
    super(1, 'template');
  }

  /**
 * Find all entries without conditions.
 * @returns {Promise}
 */
  async getAll(): Promise<any> {
    const items: Template[] = [];
    return new Promise((resolve, reject) => {
      super.findAll().then((entries: any) => {
        if (entries && entries.length > 0) {
          entries.forEach((element: Template) => {
            const newStructure = new Template();
            newStructure.id = element.id;
            newStructure.name = element.name;
            newStructure.author = element.author;
            newStructure.pug = element.pug;
            newStructure.created_at = new Date(element.created_at);
            newStructure.updated_at = new Date(element.updated_at);
            items.push(newStructure);
          });
        }

        // Default template
        this.httpClient.get('assets/example/default_pug.pug', { responseType: 'text' })
          .subscribe(data => {
            const defaultTemplate = new Template();
            defaultTemplate.id = 0;
            defaultTemplate.name = "Default";
            defaultTemplate.author = "EDPB";
            defaultTemplate.pug = data;
            this.default_pug = data;
            items.unshift(defaultTemplate);
            resolve(items);
          });
      });
    });
  }

  /**
* Get a Template.
* @param id - The KnowledgeBase id.
* @returns - New Promise
*/
  async get(id: number): Promise<Template> {
    return new Promise((resolve, reject) => {
      this.find(id)
        .then((entry: any) => {
          resolve(entry);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
 * Create a new Template.
 * @returns {Promise}
 */
  override async create(template: Template): Promise<Template> {

    const data = {
      name: template.name,
      author: template.author,
      pug: template.pug,
      created_at: new Date(),
      updated_at: new Date()
    };

    return new Promise((resolve, reject) => {
      super
        .create(data, 'template')
        .then((result: any) => {
          resolve(result.id);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  
  export(id: number): void {
    function export_result(data: string) {
      const date = new Date().getTime();

      const a = document.getElementById('base-exportBlock');
      if (a) {
        const url =
          'data:text/html;charset=utf-8,' +
          encodeURIComponent(data);
        a.setAttribute('href', url);
        a.setAttribute(
          'download',
          date + '_export_template_' + id + '.pug'
        );
        const event = new MouseEvent('click', {
          view: window
        });
        a.dispatchEvent(event);
      }
    }


    if (id == 0) {
      export_result(this.default_pug);
    } else {
      this.find(id).then((template: Template) => {
        export_result(template.pug);
      });
    }
  }

  override async update(template: Template): Promise<any> {
    return new Promise((resolve, reject) => {
      this.find(template.id).then((entry: any) => {
        entry.name = template.name;
        entry.author = template.author;
        entry.updated_at = new Date();

        super
          .update(template.id, entry, 'template')
          .then((res) => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }
}
