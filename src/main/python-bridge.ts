import { spawn, ChildProcess } from 'child_process';
import { WebSocketServer, WebSocket } from 'ws';

interface IPythonBridge {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  send: (message: object) => void;
  onMessage: (handler: (msg: object) => void) => void;
}

export class PythonBridge {
  private pythonProcess: ChildProcess | null = null;
  private wsServer: WebSocketServer | null = null;
  private wsClients: Set<WebSocket> = new Set();
  private messageHandlers: ((msg: object) => void)[] = [];
  private pythonWsPort = 8765;

  async start(): Promise<void> {
    // Start Python Mini-Agent subprocess
    this.pythonProcess = spawn('python', ['-m', 'mini_agent'], {
      cwd: 'D:\\MyWorkspace\\Mini-Agent',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        MINIMAX_API_KEY: process.env.MINIMAX_API_KEY || '',
      },
    });

    this.pythonProcess.stdout?.on('data', (data: Buffer) => {
      console.log('[Python stdout]:', data.toString());
    });

    this.pythonProcess.stderr?.on('data', (data: Buffer) => {
      console.error('[Python stderr]:', data.toString());
    });

    this.pythonProcess.on('error', (err) => {
      console.error('[Python process error]:', err);
    });

    // Start WebSocket server to bridge to Python
    return new Promise((resolve) => {
      this.wsServer = new WebSocketServer({ port: this.pythonWsPort });

      this.wsServer.on('connection', (ws) => {
        this.wsClients.add(ws);
        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());
            this.messageHandlers.forEach((h) => h(msg));
          } catch (e) {
            console.error('Failed to parse message from Python:', e);
          }
        });
        ws.on('close', () => {
          this.wsClients.delete(ws);
        });
      });

      this.wsServer.on('listening', () => {
        console.log(`[PythonBridge] WebSocket server on port ${this.pythonWsPort}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    this.wsClients.forEach((ws) => ws.close());
    this.wsServer?.close();
    this.pythonProcess?.kill();
  }

  send(message: object): void {
    const payload = JSON.stringify(message);
    this.wsClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }

  onMessage(handler: (msg: object) => void): void {
    this.messageHandlers.push(handler);
  }

  async executeMmxCommand(args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const proc = spawn('mmx', args, { shell: true });
      let stdout = '';
      let stderr = '';
      proc.stdout?.on('data', (d) => { stdout += d.toString(); });
      proc.stderr?.on('data', (d) => { stderr += d.toString(); });
      proc.on('close', (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(`mmx exited ${code}: ${stderr}`));
      });
    });
  }
}