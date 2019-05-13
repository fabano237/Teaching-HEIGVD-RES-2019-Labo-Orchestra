const DGRAM  = require('dgram');
const MOMENT = require('moment');
const NET    = require('net');

const EXTERNAL_PORT = 2205;
const EXTERNAL_HOST = '0.0.0.0';

const INTERNAL_PORT = 1111;
const INTERNAL_HOST = '235.255.1.1';
const SOCKET        = DGRAM.createSocket('udp4');

// used to find an instrument from it's sound.
const INSTRUMENTS = new Map();
INSTRUMENTS.set('ti-ta-ti', 'piano');
INSTRUMENTS.set('pouet', 'trumpet');
INSTRUMENTS.set('trulu', 'flute');
INSTRUMENTS.set('gzi-gzi', 'violin');
INSTRUMENTS.set('boum-boum', 'drum');

const musicians        = new Map();
const MUSICIAN_IS_GONE = 5;
var MESSAGE_TO_SEND;

/**
 * Create a Musician, as needed.
 * @param {any} uuid make the musician unique
 * @param {any} instrument the instrument the user is playing with.
 */
function Musician() {
  this.uuid;
  this.instrument;
  this.lastActivity = MOMENT().format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Delete the musician from the list if he's gone from the orchestra for more than a certain time.
 * @param {any} m the musician to check and maybe delete
 */
function deleteMusicianIfHeIsNotActive(m) {
  if (MOMENT().diff(m.lastActivity, 'seconds') > MUSICIAN_IS_GONE) {
    console.log(`Deleting ${m}`);
    musicians.delete(m);
  } else {
    console.log(`Adding ${m}`);
    MESSAGE_TO_SEND.push(m);
  }
}

// On first connection.
const server = NET.createServer((s) => {
  MESSAGE_TO_SEND = [];
  musicians.forEach(deleteMusicianIfHeIsNotActive);
  s.write(`${JSON.stringify(MESSAGE_TO_SEND, null, '\t')}\n`);
  s.end();
});

/**
 * The auditor can determine the instrument from a sound.
 * @param {any} sound the sound the auditor hear.
 * @returns the name of the instrument.
 */
function getInstrument(sound) {
  if (!(INSTRUMENTS.has(sound))) {
    console.log(`Error. Unknown sound ${sound}`);
  }
  return INSTRUMENTS.get(sound);
}

/**
 * When an instrument is played the auditor receive the sound and update his musician map.
 * @param {any} message a json message received from the musician
 * @param {any} source the author of the message
 */
function listener(message, source) {
  var jsonObject = JSON.parse(message);
  var musician = new Musician();

  musician.lastActivity = MOMENT(new Date());
  musician.uuid = jsonObject.uuid;
  musician.instrument = getInstrument(jsonObject.sound);

  musicians.set(musician.uuid, musician);

  console.log(`${source.address} ${source.port} ${message}`);
}

// bind the socket and add the membership.
SOCKET.bind(INTERNAL_PORT, INTERNAL_HOST, () => {
  console.log(`Listening the orchestra on ${INTERNAL_HOST}`);
  SOCKET.addMembership(INTERNAL_HOST);
});

// open the server and wait for connections
server.listen(EXTERNAL_PORT, EXTERNAL_HOST);
SOCKET.on('message', listener);
