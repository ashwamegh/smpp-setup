const smpp = require('smpp')
require('dotenv').config()
const session = new smpp.Session({ host: '0.0.0.0', port: 9500 })

let isConnected = false;

session.on('connect', () => {
  isConnected = true;

  session.bind_transceiver({
    system_id: process.env.SYSTEM_ID,
    password: process.env.SYSTEM_PASSWORD,
    interface_version: 1,
    system_type: '380666000600',
    address_range: '+380666000600',
    addr_ton: 1,
    addr_npi: 1,
  }, (pdu) => {
    if(pdu.command_status == 0){
      console.log('Succefully bound')
    }
  })
})


session.on('close', () => {
  console.log('smpp is now disconnected');

  if(isConnected){
    session.connect()
  }
})


session.on('error', (error) => {
  console.log('smpp error', error)
  isConnected = false
})


// SEND SMS FUNCTION GOES HERE

const sendSMS = (from, to, text='This comes from ashwamegh message server') => {
  // WITH ISD +COUNTRY_CODE
  from = `+${from}`
  to = `+${to}`

  session.submit_sm({
    source_addr: from,
    destination_addr: to,
    short_message: text
  }, (pdu) => {
    if(pdu.command_status == 0){
      // Message sent successfully
      console.log(pdu.message_id)
    }
  })
}

// Acknowledging Message Delivery Report
session.on('pdu', (pdu) => {
  if(pdu.command == 'deliver_sm'){
    const sms = {
      from: null,
      to: null,
      message: null
    }

    sms.from = pdu.source_addr.toString()
    sms.to = pdu.destination_addr.toString()

    if(pdu.message_payload){
      sms.message = pdu.message_payload.message
    }

    console.log(sms);
    session.deliver_sm_resp({
      sequence_number: pdu.sequence_number
    })
  }
})