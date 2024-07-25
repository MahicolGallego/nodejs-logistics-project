// Helper
// Codigos de tareas repetitivas para ahorrar esfuerzo y modularizar

import {fileURLToPath} from 'url';
import path from 'path';

export function getPathToDBFile(pathFromCurrentFileToDBFile){
    const _filename = fileURLToPath(import.meta.url)
    const _dirname = path.dirname(_filename)



    return path.join(_dirname, pathFromCurrentFileToDBFile);
}