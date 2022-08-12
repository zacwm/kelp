import path from 'path';
import { exec } from 'child_process';

interface FFmpegInterface {
  convertVideoToMP4(filePath: string, roomId: string): Promise<string>;
  convertVideoToHLS(filePath: string, roomId: string): Promise<any>;
  extractSubtitles(filePath: string, roomId: string): Promise<any>;
  // Other
  stop(): void;
}

class FFmpeg implements FFmpegInterface {
  process: any;

  constructor() {
    this.process = null;
  }

  convertVideoToMP4(filePath: string, roomId: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      /* Commented out *for now* due to having some parameter issues
      this.process = spawn('ffmpeg', ['-i', filePath, '-codec', 'copy', '-map', '0:v:0', '-map', '0:a:0', '-movflags', '+faststart', path.join(__dirname, `.temp/${roomId}/convert.mp4`), '-progress', '-', '-nostats', '-loglevel', 'error'])

      this.process.stdout.on('data', (data) => {
        const statusItems = data.toString().split('\n');
        const isFinished = statusItems.find(item => item === 'progress=end') !== undefined;

        // TODO: Respond with progress updates via socket.
        // TODO: Still need to try get a percentage of progress if possible, but at least it can indicate that it's doing something.
        console.dir(statusItems);

        if (isFinished) return resolve({ mp4Path: path.join(__dirname, `.temp/${roomId}/convert.mp4`) });
        this.process = null;
      });

      this.process.stderr.on('data', (data) => {
        reject(data.toString());
        this.process = null;
      });
      */
      
      this.process = exec(`ffmpeg -i "${filePath}" -codec copy -movflags +faststart "${path.join(__dirname, `.temp/${roomId}/convert.mp4`)}" -progress - -nostats -loglevel error`, (err, stdout, stderr) => {
        if (err) return reject(err);
        this.process = null;

        resolve({ stdout, stderr, mp4Path: path.join(__dirname, `.temp/${roomId}/convert.mp4`) });
      });
    });
  }

  convertVideoToHLS(filePath: string, roomId: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.process = exec(`ffmpeg -i "${filePath}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${path.join(__dirname, `./.streams/${roomId}/index.m3u8`)}"`, (err, stdout, stderr) => {
        if (err) return reject(err);
        this.process = null;

        resolve({ stdout, stderr });
      });
    });
  }

  extractSubtitles(filePath: string, roomId: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.process = exec(`ffmpeg -i "${filePath}" -map 0:s:0 "${path.join(__dirname, `.streams/${roomId}/subtitles.vtt`)}"`, (err, stdout, stderr) => {
        if (err) return reject(err);
        this.process = null;

        resolve({ stdout, stderr });
      });
    });
  }

  stop(): void {
    if (this.process) this.process.kill();
  }
}

export default FFmpeg;