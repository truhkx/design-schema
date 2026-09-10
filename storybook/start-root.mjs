// Waits until the three platform Storybooks are listening, then starts the composed root.
// Storybook validates each ref from the server at startup and only marks it `server-checked`
// (credentials-omitted fetch, which works cross-origin) if it is reachable at that moment.
import net from 'node:net';
import { spawn } from 'node:child_process';

const ports = [6007, 6008, 6009];
const listening = (port) =>
  new Promise((resolve) => {
    const s = net.connect({ port, host: '127.0.0.1' });
    s.once('connect', () => { s.end(); resolve(true); });
    s.once('error', () => resolve(false));
  });

const started = Date.now();
for (const port of ports) {
  while (!(await listening(port))) {
    if (Date.now() - started > 120_000) { console.error(`[root] gave up waiting for port ${port}`); process.exit(1); }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.log(`[root] port ${port} is up`);
}
// Give the child dev servers a moment to finish their first build so index.json responds.
await new Promise((r) => setTimeout(r, 3000));
const child = spawn('storybook', ['dev', '-p', '6006', '--no-open'], { stdio: 'inherit', shell: true });
child.on('exit', (code) => process.exit(code ?? 0));
