const ifaces = require('os').networkInterfaces()

module.exports.getLocalIp = function() {
  const address = Object.keys(ifaces)
    .map(ifname => {
      return ifaces[ifname].filter(details => {
        return 'IPv4' === details.family && !details.internal
      })[0]
    })
    .filter(addr => addr)[0].address

  return address
}
