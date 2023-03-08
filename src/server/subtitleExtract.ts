import fluentFfmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import path from 'path';

export default function subtitleExtract(filePath: string, roomId: string): Promise<any> {
  return new Promise((resolve: any, reject: any) => {
    // Probe for subtitle tracks
    fluentFfmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const subtitleStreams = metadata.streams.filter(stream => stream.codec_type === 'subtitle');
      if (subtitleStreams.length === 0) return resolve({ subtitles: [] });

      // Loop through each subtitle track and extract it to the temp room folder.
      const subtitleExtractPromises = subtitleStreams.map((stream, index) => {
        return new Promise((extractResolve: any, extractReject: any) => {
          fluentFfmpeg(filePath)
            .outputOptions([
              `-map 0:s:${index}`,
            ])
            .on('error', (err) => {
              console.warn(`Error extracting subtitle track ${stream.index} (language: ${stream.tags.language}) for room ${roomId}`);
              console.warn(err);
              extractResolve({
                index: stream.index,
                language: stream.tags.language,
                title: stream.tags.title,
                error: true,
              });
            })
            .on('end', () => {
              extractResolve({
                index: stream.index,
                language: stream.tags.language,
                title: stream.tags.title,
              });
            })
            .save(path.join(__dirname, `../.temp/${roomId}/subtitle${stream.index}.vtt`));
        });
      });

      Promise.all(subtitleExtractPromises)
        .then((values) => {
          const subtitleTracks = values.filter(value => !value.error);
          const VTTtoJSONParsePromises = subtitleTracks.map((track) => {
            return new Promise((parseResolve: any, parseReject: any) => {
              const VTTfile = fs.readFileSync(path.join(__dirname, `../.temp/${roomId}/subtitle${track.index}.vtt`), 'utf8');
              parseVTTFile(VTTfile)
                .then((parsedCues) => {
                  parseResolve(parsedCues);
                })
                .catch(() => {
                  parseResolve([]);
                });
            });
          });

          Promise.all(VTTtoJSONParsePromises)
            .then((cues) => {
              const subtitles = {
                tracks: subtitleTracks.map((track, index) => {
                  return {
                    index: index,
                    language: track.language,
                    title: track.title,
                  };
                }),
                cues: cues,
              };
              
              // Write to file
              fs.writeFileSync(path.join(__dirname, `../.streams/${roomId}/subtitles.json`), JSON.stringify(subtitles, null, 0));

              resolve(true);
            })
            .catch(() => {
              console.error('Error parsing VTT files.');
              resolve(false);
            });
        })
        .catch(() => {
          console.error('Error extracting subtitle tracks.');
          resolve(false);
        });
    });
  });
}

async function parseVTTFile(file) {
  try {
    const lines = file.split(/\n\n/);
    const cues = [];
  
    const timeToTimestamp = (time) => {
      // Accepts both MM:SS.MS and HH:MM:SS.MS formats and converts it to milliseconds
      const parts = time.split(':');
      const seconds = parts.pop().split('.');
      const minutes = parts.pop();
      const hours = parts.pop() || 0;
  
      return (
        parseInt(hours, 10) * 60 * 60 * 1000 +
        parseInt(minutes, 10) * 60 * 1000 +
        parseInt(seconds[0], 10) * 1000 +
        parseInt(seconds[1], 10)
      );
    };
  
    for (let i = 1; i < lines.length; i++) {
      const timeLine = lines[i].split(/\n/)[0];
      const time = timeLine.split(' --> ');
      const start = timeToTimestamp(time[0]);
      const end = timeToTimestamp(time[1]);
      const text = lines[i].split(/\n/).slice(1).join(' ');
  
      cues.push({
        start,
        end,
        text,
      });
    }
  
    return cues;
  } catch (vttParseError) {
    console.error(vttParseError);
    return [];
  }
}