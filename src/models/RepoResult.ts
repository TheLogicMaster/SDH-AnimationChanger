import moment, { Moment } from "moment";
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

  public moment_date: Moment;

  get relative_date(): string {
    return this.moment_date.fromNow();
  }

  constructor(json: any) {
    Object.assign(this, json);
    this.moment_date = moment(this.last_changed);
  }

}