// [getTitles] Get titles
// Returns a list of titles from the Popcorn Time API.

import { SocketManagerProps } from '../SocketManagerProps';
import axios from 'axios';

export default async function getTitles(_socketManager: SocketManagerProps, ...args: any[]): Promise<void> {
  const [opts, callback] = args;

  try {
    const urlParamsList = [];
    if (opts.keywords) urlParamsList.push(`keywords=${opts.keywords.replace(' ', '%20')}`);
    if (opts.genre) urlParamsList.push(`genre=${opts.genre}`);
    if (opts.sort) urlParamsList.push(`sort=${opts.sort}`);

    const { data } = await axios.get(`${process.env.POPCORN_TIME_API}${opts.category}/${opts.page || 1}?${urlParamsList.join('&')}`);
    if ((data || []).length === 0) return callback({ error: 'No titles found' });
    callback({ titles: data || [] });
  } catch (err) {
    console.warn(err);
    callback({ error: 'Internal Server Error' });
  }
}