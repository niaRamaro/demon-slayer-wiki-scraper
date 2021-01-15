export function getDumpDirectoryName(): string {
  const today = new Date();

  const getMonth = (date: Date) => {
    const realMonth = date.getMonth() + 1;

    return realMonth >= 10 ? realMonth : `0${realMonth}`;
  };

  return `${today.getFullYear()}-${getMonth(today)}-${today.getDate()}`;
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
