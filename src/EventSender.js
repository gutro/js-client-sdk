import * as utils from './utils';

const MAX_URL_LENGTH = 2000;

export default function EventSender(eventsUrl) {
  const sender = {};

  function getResponseInfo(xhr) {
    const ret = { status: xhr.status };
    const dateStr = xhr.getResponseHeader('Date');
    if (dateStr) {
      const date = Date.parse(dateStr);
      if (date) {
        ret.serverTime = date.getTime();
      }
    }
    return ret;
  }

  function sendChunk(events, sync) {
    const src = eventsUrl + '?d=' + utils.base64URLEncode(JSON.stringify(events));

    const send = onDone => {
      const hasCors = 'withCredentials' in new XMLHttpRequest();
      // Detect browser support for CORS
      if (hasCors) {
        /* supports cross-domain requests */
        const xhr = new XMLHttpRequest();
        xhr.open('GET', src, !sync);
        utils.addLDHeaders(xhr);

        if (!sync) {
          xhr.addEventListener('load', () => {
            onDone(getResponseInfo(xhr));
          });
        }

        xhr.send();
      } else {
        const img = new Image();

        if (!sync) {
          img.addEventListener('load', onDone);
        }

        img.src = src;
      }
    };

    if (sync) {
      send();
    } else {
      return new Promise(resolve => {
        send(resolve);
      });
    }
  }

  sender.sendEvents = function(events, sync) {
    const finalSync = sync === undefined ? false : sync;
    const chunks = utils.chunkUserEventsForUrl(MAX_URL_LENGTH - eventsUrl.length, events);
    const results = [];
    for (let i = 0; i < chunks.length; i++) {
      results.push(sendChunk(chunks[i], finalSync));
    }
    return sync ? Promise.resolve() : Promise.all(results);
  };

  return sender;
}