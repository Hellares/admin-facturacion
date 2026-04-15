/**
 * Logger que solo emite en desarrollo (Vite DEV mode).
 * En produccion todos los metodos son no-op para mantener los logs limpios.
 */
const noop = () => {};
const isDev = import.meta.env.DEV;

export const devLog = {
  log: isDev ? console.log.bind(console) : noop,
  info: isDev ? console.info.bind(console) : noop,
  warn: isDev ? console.warn.bind(console) : noop,
  error: isDev ? console.error.bind(console) : noop,
  debug: isDev ? console.debug.bind(console) : noop,
};
