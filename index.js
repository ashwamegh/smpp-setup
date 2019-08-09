const smpp = require('smpp')
const session = new smpp.Session({ host: '0.0.0.0', port: 9500 })
require('dotenv').config()

let isConnected = false;

session.on('connect', () => {
  isConnected = true;

  session.bind_transceiver({
    system_id: process.env.SYSTEM_ID,
    password: process.env.SYSTEM_PASS,
    interface_version: 1,
    system_type: '380666000600',
    address_range: '+380666000600',
    addr_ton: 1,
    addr_npi: 1,
  }, (pdu) => {
    if(pdu.command_status == 0){
      console.log('Succefully bound')
    }
  }
  })
})