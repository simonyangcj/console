import * as _ from 'lodash-es';
import { gettext } from './gettext';

// Behaves like moment.js's fromNow
export const fromNow = (dateTime, now=undefined, options = { omitSuffix: false }) => {
  if (!now) {
    now = new Date();
  }
  dateTime = new Date(dateTime);
  const secondsAgo = (now.getTime() - dateTime.getTime()) / 1000;
  const minutesAgo = secondsAgo / 60;
  const hoursAgo = minutesAgo / 60;
  const daysAgo = hoursAgo / 24;

  if (daysAgo > 548) {
    const count = Math.round(daysAgo / 365);
    return (options.omitSuffix) ? `${count} ${gettext('years')}`:`${count} ${gettext('years ago')}`;
  }
  if (daysAgo > 320) {
    return (options.omitSuffix) ? gettext('year'): gettext('a year ago');
  }
  if (daysAgo > 45) {
    const count = Math.round(daysAgo / 30);
    return (options.omitSuffix) ? `${count} ${gettext('months')}`:`${count} ${gettext('months ago')}`;
  }
  if (daysAgo > 26) {
    return (options.omitSuffix) ? gettext('month'): gettext('a month ago');
  }
  if (hoursAgo > 36) {
    const count = Math.round(daysAgo);
    return (options.omitSuffix) ? `${count} ${gettext('days')}`:`${count} ${gettext('days ago')}`;
  }
  if (hoursAgo > 22) {
    return (options.omitSuffix) ? gettext('day'): gettext('a day ago');
  }
  if (minutesAgo > 90) {
    const count = Math.round(hoursAgo);
    return (options.omitSuffix) ? `${count} ${gettext('hours')}`:`${count} ${gettext('hours ago')}`;
  }
  if (minutesAgo > 45) {
    return (options.omitSuffix) ? gettext('hour'): gettext('an hour ago');
  }
  if (secondsAgo > 90) {
    const count = Math.round(minutesAgo);
    return (options.omitSuffix) ? `${count} ${gettext('minutes')}`:`${count} ${gettext('minutes ago')}`;
  }
  if (secondsAgo > 45) {
    return (options.omitSuffix) ? gettext('minute'): gettext('a minute ago');
  }
  if (secondsAgo > 15) {
    return (options.omitSuffix) ? gettext('few seconds'): gettext('less than a minute ago');
  }

  if (secondsAgo >= 0) {
    return (options.omitSuffix) ? gettext('few seconds'): gettext('a few seconds ago');
  }

  if (secondsAgo > -45) {
    return gettext('a few seconds from now');
  }
  if (secondsAgo > -90) {
    return gettext('a minute from now');
  }
  if (minutesAgo > -45) {
    return gettext('%s minutes from now', (-Math.round(minutesAgo)).toString());
  }
  if (minutesAgo > -90) {
    return gettext('an hour from now');
  }
  if (hoursAgo > -22) {
    return gettext('%s hours from now', (-Math.round(hoursAgo)).toString());
  }
  if (hoursAgo > -36) {
    return gettext('a day from now');
  }
  if (daysAgo > -26) {
    return gettext('%s days from now', (-Math.round(daysAgo)).toString());
  }
  if (daysAgo > -45) {
    return gettext('a month from now');
  }
  if (daysAgo > -320) {
    return gettext('%s months from now', (-Math.round(daysAgo / 30)).toString());
  }
  if (daysAgo > -580) {
    return gettext('a year from now');
  }
  return gettext('%s years from now', (-Math.round(daysAgo / 365)).toString());
};

export const isValid = (dateTime: Date) => dateTime instanceof Date && !_.isNaN(dateTime.valueOf());

// Formats a duration in milliseconds like '1h10m23s'.
export const formatDuration = (ms: number) => {
  if (!_.isFinite(ms) || ms < 0) {
    return '';
  }

  const totalSeconds = Math.round(ms / 1000);
  const secondsInHour = 60 * 60;
  const secondsInMinute = 60;

  const hours = Math.floor(totalSeconds / secondsInHour);
  const minutes = Math.floor((totalSeconds % secondsInHour) / secondsInMinute);
  const seconds = totalSeconds % secondsInMinute;

  let formatted = '';
  if (hours) {
    formatted += `${hours}h `;
  }
  if (hours || minutes) {
    formatted += `${minutes}m `;
  }
  formatted += `${seconds}s`;

  return formatted;
};
