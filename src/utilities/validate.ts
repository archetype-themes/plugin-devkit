import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Checks if a directory is a theme repository by looking for required theme directories
 * @param directory The directory to check
 * @returns boolean indicating if the directory is a theme repository
 */
export function isThemeRepo(directory: string): boolean {
  const requiredDirs = ['sections', 'templates', 'layout', 'assets', 'config'];
  
  return requiredDirs.every(dir => 
    existsSync(join(directory, dir))
  );
}

/**
 * Checks if a directory is a component repository by looking for package.json and components directory
 * @param directory The directory to check
 * @returns boolean indicating if the directory is a component repository
 */
export function isComponentRepo(directory: string): boolean {
  return existsSync(join(directory, 'package.json')) && 
         existsSync(join(directory, 'components'));
}
