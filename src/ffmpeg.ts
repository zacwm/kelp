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
      exec(`ffmpeg -i "${filePath}" -codec copy "${path.join(__dirname, `./.temp/${roomId}/convert.mp4`)}"`, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve({ stdout, stderr, mp4Path: path.join(__dirname, `./.temp/${roomId}/convert.mp4`) });
      });
    });
  }

  convertVideoToHLS(filePath: string, roomId: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      exec(`ffmpeg -i "${filePath}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${path.join(__dirname, `./.streams/${roomId}/index.m3u8`)}"`, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve({ stdout, stderr });
      });
    });
  }

  extractSubtitles(filePath: string, roomId: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      exec(`ffmpeg -i "${filePath}" -map 0:s:0 "${path.join(__dirname, `./.streams/${roomId}/subtitles.vtt`)}"`, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve({ stdout, stderr });
      });
    });
  }

  stop(): void {
    if (this.process) this.process.kill();
  }
}

export default FFmpeg;