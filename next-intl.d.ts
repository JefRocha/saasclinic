import { AbstractIntlMessages } from 'next-intl';

declare module 'next-intl' {
  interface IntlMessages extends AbstractIntlMessages, typeof import('./src/locales/pt-BR.json') {}
}