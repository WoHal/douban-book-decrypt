
var Base64Binary = {
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
	/* will return a  Uint8Array type */
	decodeArrayBuffer: function(input) {
		var bytes = (input.length/4) * 3;
		var ab = new ArrayBuffer(bytes);
		this.decode(input, ab);
		
		return ab;
	},

	removePaddingChars: function(input){
		var lkey = this._keyStr.indexOf(input.charAt(input.length - 1));
		if(lkey == 64){
			return input.substring(0,input.length - 1);
		}
		return input;
	},

	decode: function (input, arrayBuffer) {
		//get last chars to see if are valid
		input = this.removePaddingChars(input);
		input = this.removePaddingChars(input);

		var bytes = parseInt((input.length / 4) * 3, 10);
		
		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;
		
		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);
		
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		
		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = this._keyStr.indexOf(input.charAt(j++));
			enc2 = this._keyStr.indexOf(input.charAt(j++));
			enc3 = this._keyStr.indexOf(input.charAt(j++));
			enc4 = this._keyStr.indexOf(input.charAt(j++));
	
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
	
			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}
	
		return uarray;	
	}
}

function rc4Decrypt(cipherBuf, key = 'hjasbdn2ih823rgwudsde7e2dhsdhas') {
    var keyCodeArray = key.split('').map(v => v.charCodeAt(0))
    var keyLen = keyCodeArray.length
    var cipherLen = cipherBuf.length
    var result = new Uint8Array(cipherLen)
    var o = []
    var i = 0
    var s = 0
    for (s = 0; s < 256; s++) {
        o[s] = s;
    }

    for (s = 0; s < 256; s++) {
        i = (i + o[s] + keyCodeArray[s % keyLen]) % 256
        ;([ o[s], o[i] ] = [ o[i], o[s] ])
    }

    s = 0,
    i = 0;

    for (var u = 0; u < cipherLen; u++) {
        s = (s + 1) % 256
        i = (i + o[s]) % 256

        ;([o[s], o[i]] = [o[i], o[s]])

        result[u] = cipherBuf[u] ^ o[(o[s] + o[i]) % 256];
    }

    return result
}

var XXHash = require('xxhashjs')
var bplist = require('./bplist-parser')

function dec(cipherText) {
    var keyLen = 16
    var seed = 41405
    var buf = Base64Binary.decode(cipherText)
    var keyStart = Math.floor((buf.length - 2 * keyLen) / 3)
    var encryptedKeyBuf = buf.subarray(keyStart, keyStart + keyLen)
    var key = XXHash.h64(Buffer.from(encryptedKeyBuf), seed).toString(16)

    // var cipherBuf = new Uint8Array(
    //     Buffer.from([...buf.subarray(0, s), ...buf.subarray(s + keyLen)])
    // )
    var cipherBuf = Buffer.from([...buf.subarray(0, keyStart), ...buf.subarray(keyStart + keyLen)])
    var bplistData = rc4Decrypt(cipherBuf, key)
    var list = bplist.parseBuffer(Buffer.from(bplistData))

    return bplistData
}

module.exports = dec