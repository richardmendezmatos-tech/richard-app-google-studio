
/**
 * Servicio de gestión de Cookies para Richard Automotive.
 * Permite persistir datos del usuario de forma segura.
 */

export const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  // SameSite=Lax y Secure aseguran que la cookie se maneje correctamente en navegadores modernos
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax; Secure";
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const eraseCookie = (name: string) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

/**
 * Registra una visita del usuario.
 * Útil para saber si es un usuario recurrente.
 */
export const trackUserVisit = () => {
    const visits = getCookie('richard_visits');
    const newCount = visits ? parseInt(visits) + 1 : 1;
    setCookie('richard_visits', newCount.toString(), 365);
    return newCount;
};
