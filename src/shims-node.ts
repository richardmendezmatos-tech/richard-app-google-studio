
// Custom Node.js shims for browser-based bundling
// These provide the minimal exports required to satisfy the bundler for dependencies like @github/copilot-sdk

export const spawn = () => {
    console.warn('[Shim] node:child_process.spawn called in browser - this is a no-op');
    return {
        on: () => { },
        stdout: { on: () => { } },
        stderr: { on: () => { } },
        kill: () => { }
    };
};

export class Socket {
    connect() { console.warn('[Shim] node:net.Socket.connect called in browser - this is a no-op'); }
    on() { return this; }
    write() { return true; }
    end() { }
    destroy() { }
}

export const connect = () => new Socket();

export default {
    spawn,
    Socket,
    connect
};
