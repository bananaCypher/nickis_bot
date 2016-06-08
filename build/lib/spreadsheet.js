'use strict';
var GoogleSpreadsheet = require('google-spreadsheet');
var moment = require('moment');
var utilities = require('./utilities');
var client_email = process.env.NICKIS_SHEET_EMAIL;
var private_key = process.env.NICKIS_SHEET_KEY.replace(/\\n/g, '\n');
var HEADERS = ['Name', 'Filling 1', 'Filling 2'];
var doc = new GoogleSpreadsheet(process.env.NICKIS_SHEET_ID);
var authenticate = function (email, key) {
    email = email;
    key = key;
    return new Promise(function (resolve, reject) {
        var creds_json = {
            client_email: email,
            private_key: key
        };
        doc.useServiceAccountAuth(creds_json, function (err) {
            if (err)
                reject(Error(err));
            resolve();
        });
    });
};
var createSheet = function (title) {
    return new Promise(function (resolve, reject) {
        doc.addWorksheet({ title: title }, function (err, sheet) {
            if (err)
                reject(Error(err));
            resolve(sheet);
        });
    });
};
var addHeadersToSheet = function (sheet, headers) {
    return new Promise(function (resolve, reject) {
        sheet.setHeaderRow(headers, function (err, row) {
            if (err)
                reject(Error(err));
            resolve(row);
        });
    });
};
var getOrCreateSheet = function (title) {
    return new Promise(function (resolve, reject) {
        getSheet(title).then(function (sheet) {
            if (sheet) {
                resolve(sheet);
            }
            else {
                createSheet(title).then(function (sheet) {
                    addHeadersToSheet(sheet, HEADERS);
                    resolve(sheet);
                });
            }
        }).catch(function (err) {
            reject(err);
        });
    });
};
var getSheet = function (title) {
    return new Promise(function (resolve, reject) {
        getSheets().then(function (sheets) {
            resolve(sheets.find(function (sheet) { return sheet.title === title; }));
        }, reject);
    });
};
var getSheets = function () {
    return new Promise(function (resolve, reject) {
        getInfo().then(function (info) {
            resolve(info.worksheets);
        }, reject);
    });
};
var getRows = function (sheet) {
    return new Promise(function (resolve, reject) {
        sheet.getRows({
            offset: 1,
            limit: 100
        }, function (err, rows) {
            if (err)
                reject(Error(err));
            resolve(rows);
        });
    });
};
var findRow = function (sheet, func) {
    return new Promise(function (resolve, reject) {
        getRows(sheet).then(function (rows) {
            resolve(rows.find(func));
        }, reject);
    });
};
var addRow = function (sheet, rowData) {
    return new Promise(function (resolve, reject) {
        sheet.addRow(rowData, function (err, row) {
            if (err)
                reject(Error(err));
            resolve(row);
        });
    });
};
var getInfo = function () {
    return new Promise(function (resolve, reject) {
        doc.getInfo(function (err, info) {
            if (err)
                reject(Error(err));
            resolve(info);
        });
    });
};
var saveRow = function (row) {
    return new Promise(function (resolve, reject) {
        row.save(function (err) {
            if (err)
                reject(Error(err));
            resolve();
        });
    });
};
var updateRow = function (row, data) {
    return new Promise(function (resolve, reject) {
        saveRow(applyObjectToRow(row, data)).then(function (row) {
            resolve(row);
        }, reject);
    });
};
var rowToObject = function (row, headers) {
    return headers
        .map(keySafeString)
        .reduce(function (object, header) {
        object[header] = row[header];
        return object;
    }, {});
};
var applyObjectToRow = function (row, obj) {
    Object.keys(obj).forEach(function (key) {
        if (row[key]) {
            row[key] = obj[key];
        }
    });
    return row;
};
var keySafeString = function (unsafe) {
    return unsafe.toLowerCase().replace(/ /g, "");
};
var updateRotaSheet = function () {
    return new Promise(function (resolve, reject) {
        getSheet('rota')
            .then(getRows)
            .then(function (users) { return users.map(function (user) {
            var thisFriday = utilities.getFridayDate();
            var userFriday = moment(user.nextnickisdate, 'DD/MM/YY').format('X');
            if (userFriday === 'invalid date') {
                userFriday = 0;
            }
            if (userFriday < thisFriday) {
            }
        }); });
    });
};
authenticate(client_email, private_key).then(function () {
}, function (err) {
    throw err;
});
module.exports = {
    addOrder: function (order) {
        return new Promise(function (resolve, reject) {
            var date = moment(order.fridayDate, 'X').format('DD/MM/YYYY');
            getOrCreateSheet(date).then(function (sheet) {
                var row = findRow(sheet, function (row) { return row.name === order.name; })
                    .then(function (row) {
                    if (!row) {
                        addRow(sheet, order).then(function () { return resolve('added'); });
                    }
                    else {
                        updateRow(row, order).then(function () { return resolve('updated'); });
                    }
                });
            }).catch(reject);
        });
    },
    getNextUser: function () {
        return new Promise(function (resolve, reject) {
            updateRotaSheet();
            getSheet('rota')
                .then(getRows)
                .then(function (rows) { return resolve(rows.sort(function (x, y) {
                var xMoment = moment(x.nextnickisdate, 'DD/MM/YY').format('X');
                if (xMoment === 'invalid date') {
                    xMoment = 0;
                }
                var yMoment = moment(y.nextnickisdate, 'DD/MM/YY').format('X');
                if (yMoment === 'invalid date') {
                    yMoment = 0;
                }
                console.log(xMoment - yMoment);
                return xMoment - yMoment;
            })[0]); });
        });
    }
};
//# sourceMappingURL=spreadsheet.js.map