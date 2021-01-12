import fs from 'fs';
import path from 'path';

import { fsConfig } from './config';

function saveFile(filePath: string, content: string): Promise<void> {
  const directoryName = path.dirname(filePath);

  if (!fs.existsSync(directoryName)) {
    fs.mkdirSync(directoryName, { recursive: true });
  }

  return new Promise((resolve) => {
    fs.writeFile(filePath.split(':').join('--'), content, {}, () => {
      console.log('Saved at : ', filePath);
      resolve();
    });
  });
}

export async function saveJSON(
  fileName: string,
  content: unknown,
): Promise<void> {
  const filePath = `${fsConfig.directories.BASE}/${fileName}.json`;

  await saveFile(filePath, JSON.stringify(content));
}

export function readJSON<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath).toString());
}

export async function asyncBatch<T, R>(
  items: T[],
  asyncOperation: (item: T) => Promise<R[]>,
  callback: (index: number, results: R[]) => void,
  batchSize = 10,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const temporaryItems = items.slice(i, i + batchSize);
    const asyncOperationsResults = await Promise.all(
      temporaryItems.map((item) => asyncOperation(item)),
    );
    asyncOperationsResults.forEach((results, index) => {
      callback(index + i, results);
    });
  }
}
