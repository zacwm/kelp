import path from 'path';
import WebTorrent from 'webtorrent';

const client = new WebTorrent();
const magnetURI = 'magnet:?xt=urn:btih:42DE3C3F9010426FD6F4546F0D9D2249EE7FFC7C&dn=I+Want+to+Eat+Your+Pancreas+2018+JAPANESE+1080p+BluRay+H264+AAC';

client.add(magnetURI, { path: path.join(__dirname, '/streams/torrent/') }, function (torrent) {
  const checkInterval = setInterval(() => {
    if (torrent.done) return clearInterval(checkInterval);
    console.log(`Name: '${torrent.name}' | Percent ${(torrent.progress * 100).toFixed(2)}% | Download Speed ${formatBytes(torrent.downloadSpeed)}/sec`);
  }, 500);

  torrent.on('done', function () {
    console.log('torrent download finished');
  });
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}