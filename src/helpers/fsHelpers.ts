import { dirname } from 'path';
import {
  existsSync, mkdirSync, readFileSync, writeFile,
} from 'fs';

import logger from './logger';
import { getDumpDirectoryName } from './basicHelpers';

export function createDirectory(directoryName: string): void {
  if (!existsSync(directoryName)) {
    mkdirSync(directoryName, { recursive: true });
  }
}

export function formatFileName(fileName = ''): string {
  const rules = [
    [' ', '_'],
    ['/', '++'],
    [':', '--'],
    ['"', '=='],
    ['?', '+-+'],
  ];

  return rules.reduce(
    (formatedFileName, [searchFor, replaceWith]) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      formatedFileName.split(searchFor).join(replaceWith),
    fileName,
  );
}

export function saveFile(filePath: string, content: string): Promise<void> {
  const directoryName = dirname(filePath);
  createDirectory(directoryName);

  return new Promise((resolve) => {
    writeFile(filePath, content, {}, () => {
      logger.info({
        message: `Saved at : ${filePath}`,
        label: 'FILE',
      });
      resolve();
    });
  });
}

export async function saveJSON(
  parentDirectory: string,
  fileName: string,
  content: unknown,
): Promise<void> {
  const formatedFileName = formatFileName(fileName);
  const jsonPath = `${getDumpDirectoryName()}/${parentDirectory}/${formatedFileName}.json`;

  await saveFile(jsonPath, JSON.stringify(content));
}

export function readJSON<T>(filePath: string): T {
  return JSON.parse(readFileSync(`${filePath}.json`).toString());
}
