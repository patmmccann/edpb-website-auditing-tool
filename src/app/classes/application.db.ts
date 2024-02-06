import { ApiService } from "../services/api.service";

/*
 * SPDX-FileCopyrightText: 2022-2023 European Data Protection Board (EDPB)
 *
 * SPDX-License-Identifier: EUPL-1.2
 */
export interface Indexes {
    indexName: string; keyPath: string;unique:boolean
  }

export class ApplicationDb {
    protected apiService: ApiService | null = null;
    
    protected dbVersion: number;
    protected tableName: string;
    protected indexes:Indexes[];
    protected objectStore: IDBObjectStore | undefined;
    public knowledge_base_id: number = 0;

    constructor(dbVersion: number, tableName: string, indexes?:Indexes[]) {
        this.dbVersion = dbVersion;
        this.tableName = tableName;
        this.indexes = indexes?indexes:[];
    }

    prepareApi(apiService: ApiService) {
        this.apiService = apiService;
    }

    /**
   * Initialize database.
   * @returns {Promise}
   */
    async initDb() {
        return new Promise((resolve, reject) => {
            const evt = window.indexedDB.open(this.tableName, this.dbVersion);
            evt.onerror = (event: any) => {
                // Hack to return the previous database if the current version is bigger than the previous one.
                const evt2 = window.indexedDB.open(this.tableName);
                evt2.onsuccess = (event2: any) => {
                    resolve(event2.target.result);
                };
                evt2.onerror = (event2: any) => {
                    console.error(event2);
                    reject(Error(event2));
                };
            };
            evt.onsuccess = (event: any) => {
                resolve(event.target.result);
            };
            evt.onupgradeneeded = (event: any) => {
                let objectStore = null;
                objectStore = event.target.result.createObjectStore(this.tableName, {
                    keyPath: 'id',
                    autoIncrement: true
                });

                if (objectStore) {
                    for (let index of this.indexes){
                        objectStore.createIndex(index.indexName, index.keyPath, {
                            unique: index.unique
                        });
                    }
                };
            };
        });
    }

    /**
 * Get the database object.
 * @returns {Promise}
 */
    async getObjectStore(): Promise<any> {
        const db: any = await this.initDb();
        db.onversionchange = () => {
            db.close();
            alert('A new version of this page is ready. Please reload!');
        };
        return new Promise((resolve, reject) => {
            this.objectStore = db
                .transaction(this.tableName, 'readwrite')
                .objectStore(this.tableName);
            if (this.objectStore) {
                resolve(this.objectStore);
            } else {
                reject(false);
            }
        });
    }

    async create(data: any | FormData, prefix?: string, preformated?: FormData): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getObjectStore().then(() => {
                if (this.objectStore) {
                    if ('id' in data) delete data.id;

                    const evt = this.objectStore.add(data);
                    evt.onerror = (event: any) => {
                        console.error(event);
                        reject(Error(event));
                    };
                    evt.onsuccess = (event: any) => {
                        // TODO: return the entire object
                        resolve({ ...data, id: event.target.result });
                    };
                } else {
                    reject(new Error('No database loaded'));
                }
            });
        });
    }

    /**
   * Find all entries without conditions.
   * Many result items (cursor for indexedDb)
   * @returns {Promise}
   */
    async findAll(withIndex?: { index: string; value: any }): Promise<any[]> {
        const items: any[] = [];
        return new Promise((resolve, reject) => {
            // console.log(this.getServerUrl(), 'indexdb');
            this.getObjectStore().then(() => {
                let evt = null;
                let index1;
                if (withIndex) {
                    if (this.objectStore) {
                        index1 = this.objectStore.index(withIndex.index);
                        evt = index1.openCursor(IDBKeyRange.only(withIndex.value));
                    }
                } else {
                    if (this.objectStore) {
                        evt = this.objectStore.openCursor();
                    }
                }

                if (evt) {
                    evt.onerror = (event: any) => {
                        console.error(event);
                        reject(Error(event));
                    };
                    evt.onsuccess = (event: any) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            items.push(cursor.value);
                            cursor.continue();
                        } else {
                            resolve(items);
                        }
                    };
                }
            });

        });
    }

    /**
   * Default find method for an entry in the database.
   * Only One Result
   * @param {any} id - The record id.
   */
    async find(id: number | string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getObjectStore().then(() => {
                if (this.objectStore) {
                    const evt = this.objectStore.get(id);
                    evt.onerror = (event: any) => {
                        console.error(event);
                        reject(Error(event));
                    };
                    evt.onsuccess = (event: any) => {
                        resolve(event.target.result);
                    };
                } else {
                    reject(new Error('No database loaded'));
                }
            });
        });
    }

    async update(id: any, entry: any, prefix?: string | null, preformated?: FormData) {
        return new Promise((resolve, reject) => {
            this.getObjectStore().then(() => {
                if (this.objectStore) {
                    const evt = this.objectStore.put(entry);
                    evt.onerror = (event: any) => {
                        console.error(event);
                        reject(Error(event));
                    };
                    evt.onsuccess = (event: any) => {
                        resolve(event.target.result);
                    };
                };
            });
        });
    }

    /**
 * Default delete method for an entry in the database.
 * @param {any} id - The record id.
 * @returns {Promise}
 */
    async delete(id: number) {
        return new Promise((resolve, reject) => {

            this.getObjectStore().then(() => {
                if (this.objectStore) {
                    const evt = this.objectStore.delete(id);
                    evt.onerror = (event: any) => {
                        console.error(event);
                        reject(Error(event));
                    };
                    evt.onsuccess = (event: any) => {
                        resolve(event.target);
                    };
                }
            });

        });
    }

}
