export const ROLES = {
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const AUTH_STORAGE_KEYS = [
  'access_token',
  'user_info',
  'role',
  'user_id',
  'tenant_id',
  'first_name',
  'last_name',
];

function getStorageValue(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function removeStorageValue(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(''),
  );
}

export function decodeJwt(token) {
  if (!token || token.split('.').length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwt(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

function normalizeRole(role) {
  return String(role || '').trim().toUpperCase();
}

function parseUserInfo() {
  try {
    return JSON.parse(getStorageValue('user_info') || '{}');
  } catch {
    return {};
  }
}

export function clearAuthSession() {
  AUTH_STORAGE_KEYS.forEach(removeStorageValue);
}

export function createSessionFromAuthData(authData = {}, fallback = {}) {
  const token = authData.access_token || authData.token || fallback.token || '';
  const tokenPayload = decodeJwt(token) || {};
  const userInfo = {
    user_id: authData.user_id ?? authData.userId ?? authData.id ?? tokenPayload.user_id ?? tokenPayload.sub ?? fallback.user_id ?? '',
    tenant_id: authData.tenant_id ?? authData.tenantId ?? tokenPayload.tenant_id ?? fallback.tenant_id ?? '',
    first_name: authData.first_name ?? fallback.first_name ?? '',
    last_name: authData.last_name ?? fallback.last_name ?? '',
    tenant_name: authData.tenant_name ?? authData.business_name ?? fallback.tenant_name ?? '',
    email: authData.email ?? fallback.email ?? tokenPayload.email ?? '',
    phone: authData.phone ?? authData.phone_number ?? fallback.phone ?? '',
    country: authData.country ?? authData.country_name ?? fallback.country ?? '',
    address: authData.address ?? authData.address_details ?? fallback.address ?? '',
    address_line1: authData.address_line1 ?? fallback.address_line1 ?? '',
    address_line2: authData.address_line2 ?? fallback.address_line2 ?? '',
    city: authData.city ?? fallback.city ?? '',
    state: authData.state ?? fallback.state ?? '',
    pincode: authData.pincode ?? authData.zip_code ?? fallback.pincode ?? '',
  };

  const role = normalizeRole(authData.role || authData.user_role || tokenPayload.role || fallback.role || ROLES.ADMIN);

  return {
    token,
    role,
    user_id: userInfo.user_id,
    tenant_id: userInfo.tenant_id,
    user: userInfo,
    isAuthenticated: Boolean(token) && !isTokenExpired(token),
  };
}

export function persistAuthSession(session) {
  if (!session?.token) {
    clearAuthSession();
    return;
  }

  localStorage.setItem('access_token', session.token);
  localStorage.setItem('role', session.role || '');
  localStorage.setItem('user_id', String(session.user_id || ''));
  localStorage.setItem('tenant_id', String(session.tenant_id || ''));
  localStorage.setItem('user_info', JSON.stringify(session.user || {}));
}

export function getStoredAuthSession() {
  const token = getStorageValue('access_token');

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    clearAuthSession();
    return null;
  }

  const user = parseUserInfo();
  return createSessionFromAuthData(
    {
      ...user,
      access_token: token,
      role: getStorageValue('role') || user.role,
      user_id: getStorageValue('user_id') || user.user_id,
      tenant_id: getStorageValue('tenant_id') || user.tenant_id,
    },
    user,
  );
}

export function getAccessToken() {
  const token = getStorageValue('access_token');
  return token && !isTokenExpired(token) ? token : '';
}
