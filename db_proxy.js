const net = require('net');

const LOCAL_PORT = 55432;
const REMOTE_HOST = '2406:da1c:4c7:f801:77d4:f9f4:59f4:c745';
const REMOTE_PORT = 5432;

const server = net.createServer((localSocket) => {
  console.log('[Proxy] New local client connected');
  
  const remoteSocket = net.createConnection({
    host: REMOTE_HOST,
    port: REMOTE_PORT,
    family: 6
  }, () => {
    console.log('[Proxy] Successfully connected to remote database over IPv6!');
  });

  localSocket.pipe(remoteSocket);
  remoteSocket.pipe(localSocket);

  localSocket.on('error', (err) => {
    console.error('[Proxy] Local socket error:', err.message);
    remoteSocket.destroy();
  });

  remoteSocket.on('error', (err) => {
    console.error('[Proxy] Remote socket error:', err.message);
    localSocket.destroy();
  });

  localSocket.on('close', () => {
    console.log('[Proxy] Local socket closed');
  });

  remoteSocket.on('close', () => {
    console.log('[Proxy] Remote socket closed');
  });
});

server.listen(LOCAL_PORT, '127.0.0.1', () => {
  console.log(`TCP Proxy listening on localhost:${LOCAL_PORT} -> [${REMOTE_HOST}]:${REMOTE_PORT}`);
});
