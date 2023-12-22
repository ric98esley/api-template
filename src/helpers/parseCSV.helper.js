const fs = require('fs');
const csv = require('csv-parser');

function parseCSV(filePath, separator = ',', created_by) {
  const data = [];

  if(created_by === undefined) throw new Error('created_by is required');

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ separator }))
      .on('data', (row) => {
        const parsedRow = {
          createdById: created_by,
        };

        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            const value = row[key];

            if (!isNaN(value)) {
              // Si el valor es numérico, hacer casting a Number
              parsedRow[key] = parseFloat(value);
            } else if (value === 'null' || value === 'NULL') {
              // Si el valor es 'null', establecer como null
              parsedRow[key] = null;
            } else if (
              value.toLowerCase() === 'true' ||
              value.toLowerCase() === 'false'
            ) {
              // Si el valor es 'true' o 'false', hacer casting a Boolean
              parsedRow[key] = value.toLowerCase() === 'true';
            } else {
              // De lo contrario, mantener el valor sin cambios
              parsedRow[key] = value;
            }
          }
        }

        data.push(JSON.parse(JSON.stringify(parsedRow)));
      })
      .on('end', () => {
        resolve(data);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

module.exports = { parseCSV };