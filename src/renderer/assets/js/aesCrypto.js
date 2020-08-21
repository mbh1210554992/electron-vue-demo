const crypto = require('crypto')

// AES对称加密
const aesCrypto = {}
const password = '486220'// 秘钥
// 加密
aesCrypto.aesEncrypt = (data) => {
  const cipher = crypto.createCipher('aes192', password)
  let encrypt = cipher.update(data, 'utf8', 'hex')
  encrypt += cipher.final('hex')
  return encrypt
}
// 解密
aesCrypto.aesDecrypt = (encrypted) => {
  const decipher = crypto.createDecipher('aes192', password)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export default aesCrypto
