import moment from "moment";
import { IRepoResult } from "../types/animation";

export default class RepoResult implements IRepoResult {

  public id: string;

  public name: string;

  public preview_image: string;

  public preview_video: string;

  public author: string;

  public description: string;

  public last_changed: string; 

  public source: string;

  public download_url: string;

  public likes: number;

  public downloads: number;

  public version: string;

  public target: string;

  public manifest_version: number;

  get relative_date(): string {
    return moment(this.last_changed).fromNow();
  }

  get downloaded(): boolean {
    return false;
  }

  constructor(json: any) {
    Object.assign(this, json);
  }

}