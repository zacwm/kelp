// [getTitleDetails] Get title details
// Returns the details of a title. Used on the title info overlay.

import { SocketManagerProps } from '../SocketManagerProps';
import axios from 'axios';

export default async function getTitleDetails(_socketManager: SocketManagerProps, ...args: any[]): Promise<void> {
  const [title, callback] = args;

  try {
    let type;
    if (title.type === 'movies') type = 'movie';
    if (title.type === 'shows') type = 'show';
    if (!type) return callback({ error: 'Invalid title type' });

    const { data } = await axios.get(`${process.env.POPCORN_TIME_API}${type}/${title.id}`);
    callback(data);
  } catch (err) {
    console.warn(err);
    callback({ error: 'Internal Server Error' });
  }
}