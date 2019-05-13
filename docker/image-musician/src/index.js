const UUID  = require('uuid');
const DGRAM = require('dgram');

// Internal udp socket
const INTERNAL_PORT = 1111;
const INTERNAL_HOST = '235.255.1.1';
const SOCKET = DGRAM.createSocket('udp4');
const SOUND_SENDER_INTERVAL = 1000;

// The instrument list is a map containing the name as a key and a sound as a value
const SOUNDS = new Map();
SOUNDS.set('piano', 'ti-ta-ti');
SOUNDS.set('trumpet', 'pouet');
SOUNDS.set('flute', 'trulu');
SOUNDS.set('violin', 'gzi-gzi');
SOUNDS.set('drum', 'boum-boum');

/**
 * Create a Musician with a name and a sound for his instrument
 * @param {any} key type of the musician
 */
function Musician(key) {
  this.uuid = key;
  this.sound = 'none';
}

const MUSICIAN = new Musician(UUID());

/**
 * Send a sound to the auditor.
*/
function soundSender() {
  const message = JSON.stringify(MUSICIAN);
  SOCKET.send(message, 0, message.length, INTERNAL_PORT, INTERNAL_HOST, (err) => {
    if (err) {
      console.log('ERROR: MESSAGE NOT SEND FOR AUDITOR');
      process.exit(-1);
    }
    console.log(`Sending payload: ${message} via port ${SOCKET.address().port}`);
  });
}

/**
 * Check if the instrument exist and send the sound to the auditor at an interval.
 */
function run() {
  const instrument = process.argv[2];
  if (!(SOUNDS.has(instrument))) {
    console.log('ERROR. THIS IS NOT A INSTRUMENNT');
    process.exit(-1);
  }
  MUSICIAN.sound = SOUNDS.get(instrument);
  setInterval(soundSender, SOUND_SENDER_INTERVAL);
}

run();
