import cookie from 'js-cookie';

import locale from './locale';

export const gettext = function (str, value) {
  try {
    if (!window.locale) {
      window.locale = cookie.get('openshift_language') || 'zh-cn';
    }
    const locales = locale[window.locale];
    if (!value) {
      return locales && locales[str] ? locales[str] : str;
    }
    return locales && locales[str] ? locales[str].replace('{0}', value) : str.replace('%s', value);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('asdf', error);
  }
};
