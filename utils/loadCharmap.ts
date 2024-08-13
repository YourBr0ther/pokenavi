import Papa from 'papaparse';

export async function loadCharmap(filePath: string): Promise<Record<number, string>> {
  return new Promise((resolve, reject) => {
    const charmap: Record<number, string> = {};

    fetch(filePath)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            results.data.forEach((row: any) => {
              const hexValue = parseInt(row['Hex'], 16);
              charmap[hexValue] = row['Char'];
            });
            resolve(charmap);
          },
          error: (error: any) => reject(error), // Typing the error parameter as `any`
        });
      })
      .catch((error: any) => reject(error)); // Typing the error parameter as `any`
  });
}
