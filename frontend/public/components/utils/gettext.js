import cookie from 'js-cookie';

import locale from './locale';

export const gettext = (str, value) => {
  if (!window.locale) {
    window.locale = cookie.get('locale') || 'zh-cn';
  }
  const locales = locale[window.locale];
  if (!value) {
    return locales && locales[str] ? locales[str] : str;
  }
  return locales && locales[str] ? locales[str].replace('{0}', value) : str.replace('%s', value);
};
