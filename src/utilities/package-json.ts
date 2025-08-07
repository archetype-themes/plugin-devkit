import { jsonc } from 'jsonc'
import fs from "node:fs";
import path from "node:path";

export function getNameFromPackageJson(dir: string): string|undefined {
  const pkgPath = path.join(dir, 'package.json');
  let name;
  if (fs.existsSync(pkgPath)) {
    const pkg = jsonc.parse(fs.readFileSync(pkgPath, 'utf8'), { stripComments: true });
    name = pkg.name;
  }

  return name;
}

export function getVersionFromPackageJson(dir: string): string|undefined {
  const pkgPath = path.join(dir, 'package.json');
  let version;
  if (fs.existsSync(pkgPath)) {
    const pkg = jsonc.parse(fs.readFileSync(pkgPath, 'utf8'), { stripComments: true });
    version = pkg.version;
  }

  return version;
}