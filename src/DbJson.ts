import { existsSync, writeFile, readFile } from "fs";
import { resolve } from "path";

export type DbJsonOptions = {
  forceCreate: boolean;
  logFullPath: boolean;
};

/**
 * DbJson est un objet qui permet d'enregistrer une collection d'objet dans
 * un fichier json
 */
export class DbJson<T> {
  protected readonly options: DbJsonOptions;
  protected readonly filename: string;
  constructor(filename: string, options: Partial<DbJsonOptions>) {
    const defaultOptions: DbJsonOptions = {
      forceCreate: false,
      logFullPath: false,
    };
    this.options = {
      ...defaultOptions,
      ...options,
    };

    this.filename = resolve(filename);
    if (this.options.logFullPath) {
      console.log(this.filename);
    }
    if (!existsSync(this.filename)) {
      if (this.options.forceCreate) {
        writeFile(this.filename, "", function (err) {
          if (err) throw err;
          console.log("File is created successfully.");
        });
      } else {
        throw new Error("Le fichier n'existe pas");
      }
    }
  }

  /**
   * Retourne le fichier json sous forme de collection d'objet
   * @returns T[]
   */
  async get(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      readFile(this.filename, (err, data) => {
        if (err) {
          reject(err);
        }
        const content = data.toString();
        if (content === "") {
          resolve([]);
          return;
        }
        resolve(JSON.parse(content));
      });
    });
  }

  /**
   * Enregistre une collection d'objet dans le fichier json
   * @param data T[]
   * @returns T[]
   */
  async set(data: T[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      writeFile(this.filename, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  /**
   * Ajoute un element à la collection d'objet dans le fichier json
   * @param element T
   * @returns T[]
   */
  async add(element: T): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.get()
        .then((data) => {
          const newData = [...data, element];
          resolve(this.set(newData));
        })
        .catch((error) => reject(error));
    });
  }

  /**
   * Remplace des éléments
   * @param element T
   * @param filter (e:T, i:number) => boolean
   * @returns T[]
   */
  async replace(
    element: T,
    filter: (e: T, i: number) => boolean
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.get()
        .then((data) => {
          const newData = data.map((e: T, i: number) =>
            filter(e, i) ? element : e
          );
          resolve(this.set(newData));
        })
        .catch((error) => reject(error));
    });
  }

  /**
   * Remplace des éléments
   * @param filter (e:T, i:number) => boolean
   * @returns T[]
   */
  async delete(filter: (e: T, i: number) => boolean): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.get()
        .then((data) => {
          const newData = data.filter((e: T, i: number) => !filter(e, i));
          resolve(this.set(newData));
        })
        .catch((error) => reject(error));
    });
  }
}

export default DbJson;
