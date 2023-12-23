
function decrypt(cipherBuf, key = 'hjasbdn2ih823rgwudsde7e2dhsdhas') {
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

    return Buffer.from(result)
}

module.exports = {
    decrypt
}