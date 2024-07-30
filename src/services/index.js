import { FileService } from "./file.js"
import { GitService } from "./git.js";
import { PRService } from "./pr.js";
import { TagService } from "./tag.js";
export const services = {
    file: new FileService(),
    tag : new TagService(),
    pr : new PRService(),
    git : new GitService(),
};

export default services;
