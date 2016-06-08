'use strict'
const GoogleSpreadsheet = require('google-spreadsheet');
const moment = require('moment');
const utilities = require('./utilities');
const client_email = process.env.NICKIS_SHEET_EMAIL;
const private_key = process.env.NICKIS_SHEET_KEY.replace(/\\n/g, '\n');
const HEADERS = ['Name', 'Filling 1', 'Filling 2'];
 
// spreadsheet key is the long id in the sheets URL 
const doc = new GoogleSpreadsheet(process.env.NICKIS_SHEET_ID);

const authenticate = function(email, key) {
  email = email;
  key = key;
  return new Promise(function(resolve, reject) {
    const creds_json = {
      client_email: email,
      private_key: key
    }
    doc.useServiceAccountAuth(creds_json, (err) => { 
      if(err) reject(Error(err));
      resolve(); 
    });
  });
}

const createSheet = function(title) {
  return new Promise(function(resolve, reject) {
    doc.addWorksheet({title: title}, (err, sheet) => {
      if(err) reject(Error(err));
      resolve(sheet); 
    });
  });
}

const addHeadersToSheet = function(sheet, headers) {
  return new Promise(function(resolve, reject) {
    sheet.setHeaderRow(headers, function(err, row){
      if(err) reject(Error(err));
      resolve(row); 
    })
  });
}

const getOrCreateSheet = function(title){
  return new Promise(function(resolve, reject) {
    getSheet(title).then(function (sheet) {
      if (sheet) {
        resolve(sheet);
      } else {
        createSheet(title).then(function (sheet) {
          addHeadersToSheet(sheet, HEADERS);
          resolve(sheet);
        });
      }
    }).catch(function(err){
      reject(err);
    });
  });
}

const getSheet = function(title) {
  return new Promise(function(resolve, reject) {
    getSheets().then(function(sheets){
      resolve(sheets.find((sheet) => sheet.title === title));
    }, reject);
  });
}

const getSheets = function() {
  return new Promise(function(resolve, reject) {
    getInfo().then(function(info){
      resolve(info.worksheets);
    }, reject);
  });
}

const getRows = function(sheet) {
  return new Promise(function(resolve, reject) {
    sheet.getRows({
      offset: 1,
      limit: 100,
    }, function( err, rows ){
      if(err) reject(Error(err));
      resolve(rows); 
    });
  });
}

const findRow = function(sheet, func){
  return new Promise(function(resolve, reject) {
    getRows(sheet).then(function(rows) {
      resolve( rows.find(func) )
    }, reject);
  });
}

const addRow = function(sheet, rowData){
  return new Promise(function(resolve, reject) {
    sheet.addRow(rowData, function(err, row){
      if(err) reject(Error(err));
      resolve(row); 
    })
  });
}

const getInfo = function(){
  return new Promise(function(resolve, reject) {
    doc.getInfo(function(err, info) {
      if(err) reject(Error(err));
      resolve(info); 
    });
  });
}

const saveRow = function(row){
  return new Promise(function(resolve, reject) {
    row.save(function(err){
      if(err) reject(Error(err));
      resolve(); 
    })
  });
}

const updateRow = function(row, data){
  return new Promise(function(resolve, reject) {
    saveRow(applyObjectToRow(row, data)).then(function(row){
      resolve(row);
    }, reject);
  });
}

const rowToObject = function(row, headers){
  return headers
    .map(keySafeString)
    .reduce(function(object, header) {
      object[header] = row[header]
      return object;
    }, {});
}

const applyObjectToRow = function(row, obj){
  Object.keys(obj).forEach(function(key){
    if(row[key]) {
      row[key] = obj[key];
    }
  })
  return row;
}

// string(string) => keySafe(string)
const keySafeString = function(unsafe){
  return unsafe.toLowerCase().replace(/ /g, "");
}

const updateRotaSheet = function(){
  return new Promise(function(resolve, reject) {
    getSheet('rota')
      .then(getRows)
      .then(users => users.map( user => {
        const thisFriday = utilities.getFridayDate();
        let userFriday = moment(user.nextnickisdate, 'DD/MM/YY').format('X');
        if(userFriday === 'invalid date'){userFriday = 0}
        if (userFriday < thisFriday){

        }
      } ))
  });
}

authenticate(client_email, private_key).then(function() {
}, function (err) {
  throw err;
});

module.exports = {
  addOrder: function(order){
    return new Promise(function(resolve, reject) {
      const date = moment(order.fridayDate, 'X').format('DD/MM/YYYY');
      getOrCreateSheet(date).then(function(sheet) {
        var row = findRow(sheet, function(row) {return row.name === order.name})
          .then(function(row){
            if (!row) {
              addRow(sheet, order).then(() => resolve('added')); 
            } else {
              updateRow(row, order).then(() => resolve('updated')); 
            }
          });
      }).catch(reject);
    });
  },
  getNextUser: function(){
    return new Promise(function(resolve, reject) {
      updateRotaSheet();
      getSheet('rota')
        .then(getRows)
        .then(rows => resolve(rows.sort((x, y) => {
          let xMoment = moment(x.nextnickisdate, 'DD/MM/YY').format('X');
          if(xMoment === 'invalid date'){xMoment = 0}
          let yMoment = moment(y.nextnickisdate, 'DD/MM/YY').format('X');
          if(yMoment === 'invalid date'){yMoment = 0}
          console.log(xMoment - yMoment);
          return xMoment - yMoment;
        })[0]))
    });
  }
}
