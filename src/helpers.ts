import fs from 'fs';
import path from 'path';

export function formatFileName(fileName: string): string {
  const rules = [
    ['/', '++'],
    [':', '--'],
  ];

  return rules.reduce(
    (formatedFileName, [searchFor, replaceWith]) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      formatedFileName.split(searchFor).join(replaceWith),
    fileName,
  );
}

export function getDumpDirectoryName(): string {
  const today = new Date();

  const getMonth = (date: Date) => {
    const realMonth = date.getMonth() + 1;

    return realMonth >= 10 ? realMonth : `0${realMonth}`;
  };

  return `${today.getFullYear()}-${getMonth(today)}-${today.getDate()}`;
}

export function saveFile(filePath: string, content: string): Promise<void> {
  const directoryName = path.dirname(filePath);

  if (!fs.existsSync(directoryName)) {
    fs.mkdirSync(directoryName, { recursive: true });
  }

  return new Promise((resolve) => {
    fs.writeFile(filePath, content, {}, () => {
      console.log('Saved at :', filePath);
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
  return JSON.parse(fs.readFileSync(`${filePath}.json`).toString());
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
