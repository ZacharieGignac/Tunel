const fs = require('fs');
const sha1 = require('sha1');

const scramble1 = '123';
const scramble2 = '456';
const scramble3 = '789';


var _accessList = undefined;

function getRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function loadAccessList() {
    _accessList = getAccessList();
}
function getAccessList() {
    let rawAccessList = fs.readFileSync('access.json');
    let accessList = JSON.parse(rawAccessList);
    return accessList;
}
function validateUserToken(user, token) {
    var success = false;
    var ul = getAccessList().users;
    for (var i = 0; i < ul.length; i++) {
        if (ul[i].user == user) {
            var vToken = sha1(scramble1 + ul[i].hash + scramble2 + ul[i].salt + scramble3);
            if (token == vToken) {
                success = true;
            }
        }
    }
    return success;
}

function validateToken(token) {
    var success = false;
    var ul = getAccessList().users;
    for (var i = 0; i < ul.length; i++) {
        var vToken = sha1(scramble1 + ul[i].hash + scramble2 + ul[i].salt + scramble3);
        if (token == vToken) {
            success = true;
        }
    }
    return success;
}

function createAccess(user, level) {
    var rnd = getRandomString(30);
    var token = sha1(rnd);
    var salt = sha1(getRandomString(30));
    var userToken = sha1(scramble1 + token + scramble2 + salt + scramble3);
    _accessList.users.push({
        user: user,
        hash: token,
        salt: salt,
        level: level
    });
    let data = JSON.stringify(_accessList);
    fs.writeFileSync('access.json', data);
    return userToken;
}

module.exports.getAccessList = getAccessList;
module.exports.validateToken = validateToken;
module.exports.validateUserToken = validateUserToken;
module.exports.getRandomString = getRandomString;
module.exports.createAccess = createAccess;

console.log('Loading access list...');
loadAccessList();

