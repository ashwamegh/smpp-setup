const smpp = require('smpp')
require('dotenv').config()

function checkAsyncUserPass(system_id, password, callback) {
  if (system_id === process.env.SYSTEM_ID && password === process.env.SYSTEM_PASSWORD) {
      callback(0); // no error
  } else {
      callback(1); // error
  }
}

const server = smpp.createServer(function(session) {
    session.on('bind_transceiver', function(pdu) {
        // we pause the session to prevent further incoming pdu events,
        // untill we authorize the session with some async operation.
        session.pause();
        console.log(pdu)
        checkAsyncUserPass(pdu.system_id, pdu.password, function(err) {
            if (err) {
                session.send(pdu.response({
                    command_status: smpp.ESME_RBINDFAIL
                }));
                session.close();
                return;
            }
            session.send(pdu.response());
            session.resume();
        });
    });
});
server.listen(9500);