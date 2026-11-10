const CLAVE = 'recarga-por-version';

/**
 * Tras un deploy, una pestaña abierta con la versión anterior pide pantallas (archivos
 * con hash) que ya no existen y React muestra "Failed to fetch dynamically imported module".
 * Vite avisa con 'vite:preloadError': recargamos UNA vez para traer la versión nueva.
 * La marca en sessionStorage evita un bucle si el archivo falla por otra razón.
 */
export function instalarRecargaPorVersion(win: Window = window): void {
  win.addEventListener('vite:preloadError', (event) => {
    try {
      if (win.sessionStorage.getItem(CLAVE)) return; // ya se recargó: dejar que se vea el error
      win.sessionStorage.setItem(CLAVE, '1');
    } catch {
      return; // sin sessionStorage no hay como evitar el bucle
    }
    event.preventDefault();
    win.location.reload();
  });

  // Si la página cargó bien, se permite otra recarga en el próximo deploy.
  win.setTimeout(() => {
    try {
      win.sessionStorage.removeItem(CLAVE);
    } catch {
      // nada que limpiar
    }
  }, 10_000);
}
