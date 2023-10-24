const Excel = require('exceljs');

const generateExcel = async ({ name, headingColumnNames = [], data = [] , res}) => {
  let date = new Date();
  const day = date.getDay()
  const month = date.getMonth()
  const year = date.getFullYear()

  var rows = [];
  rows.push([...headingColumnNames]);
  var workbook = new Excel.Workbook();
  var sheet = workbook.addWorksheet(name + '-' + day + '-' + month + '-' + year);
  data.forEach((record, i) => {
    const heading = Object.keys(record.dataValues);
    const row = heading.map((columnName) => {
      return record[columnName]
    })
    rows.push(row)
  })
  sheet.addRows(rows);

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + `${day}-${month}-${year}-data.xlsx`
  );

  return workbook;
};


module.exports = {
  generateExcel,
};
