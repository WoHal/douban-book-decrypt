var XXHash = require('xxhashjs')
var bplistParser = require('./bplistParser')
var RC4 = require('./RC4')
var Base64Binary = require('./Base64Binary')

function getRealUID(uid) {
    if (uid >= 2) {
        if (uid < 7)
            return uid + 5;
        if (uid < 7 + 5)
            return uid - 5
    }
    return uid
}

function generateJSON(listData) {
    var KEY_TAG = 'z'
    var VALUE_TAG = 'k'
    var UID_TAG = 'j'
    var rootUID = 4

    function parseJSONNode(data) {
        if (!data) {
            return data
        }
        var keyIndexArray = data[KEY_TAG]
        var valueArray = data[VALUE_TAG]
        var uid = data[UID_TAG]

        if (!keyIndexArray && !valueArray && uid === undefined) {
            return data
        }

        var res = {}

        if (uid !== undefined) {
            return parseJSONNode(listData[getRealUID(uid)])
        }

        if (!keyIndexArray && valueArray) {
            return valueArray.map(uid => {
                return parseJSONNode(listData[uid])
            })
        }
        
        for (var i = 0, len = keyIndexArray.length; i < len; i++) {
            var keyUid = keyIndexArray[i]
            var key = listData[getRealUID(keyUid)]
            var value = valueArray[i]

            res[key] = parseJSONNode(value)
        }

        return res
    }

    return parseJSONNode(listData[rootUID])
}

function dec(cipherText) {
    var keyLen = 16
    var seed = 41405
    var buf = Base64Binary.decode(cipherText)
    var keyStart = Math.floor((buf.length - 2 * keyLen) / 3)
    var encryptedKeyBuf = buf.subarray(keyStart, keyStart + keyLen)
    var key = XXHash.h64(Buffer.from(encryptedKeyBuf), seed).toString(16)
    var cipherBuf = Buffer.concat([buf.subarray(0, keyStart), buf.subarray(keyStart + keyLen)])
    var bplistData = RC4.decrypt(cipherBuf, key)
    var list = bplistParser.parseBuffer(bplistData)
    return generateJSON(list)
}

module.exports = dec