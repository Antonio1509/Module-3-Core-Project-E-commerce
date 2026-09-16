const API_BASE_URL = window.LOCALCART_API_URL || 'http://localhost:5000/api';
function getAuthToken(){return localStorage.getItem('token')||localStorage.getItem('localcart-token')||'';}
function getStoredUser(){try{return JSON.parse(localStorage.getItem('user')||localStorage.getItem('localcart-user')||'null')}catch{return null}}
function assetUrl(value){
  const source=String(value||'').trim();
  if(!source)return '';
  if(/^(data:|blob:|https?:\/\/)/i.test(source))return source;
  try{return new URL(source.replace(/^\.?\//,''),`${new URL(API_BASE_URL).origin}/`).href}catch{return source}
}
async function apiFetch(endpoint,options={}){const token=getAuthToken(),headers={...(options.headers||{})};if(options.body&&!(options.body instanceof FormData))headers['Content-Type']=headers['Content-Type']||'application/json';if(token)headers.Authorization=`Bearer ${token}`;const r=await fetch(`${API_BASE_URL}${endpoint}`,{...options,headers}),t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{d={message:t}}if(!r.ok){const e=new Error(d.message||d.error||`Request failed (${r.status})`);e.status=r.status;e.data=d;throw e}return d}
async function getCurrentUser(){try{const token=getAuthToken();if(!token){return getStoredUser();}const user=(await apiFetch('/auth/me'))||getStoredUser();return user||null;}catch{return getStoredUser();}}
function money(v){return `R${Number(v||0).toFixed(2)}`;}

document.addEventListener('DOMContentLoaded', async () => {
  const token = getAuthToken();
  if (!token) return;
  try {
    const user = await getCurrentUser();
    if (!user) return;
    const initials = user.avatar_initials || (user.name || '').split(/\s+/).map(x => x[0]).slice(0,2).join('').toUpperCase();
    document.querySelectorAll('[data-profile-name]').forEach(e => e.textContent = user.name || '');
    document.querySelectorAll('[data-profile-email]').forEach(e => e.textContent = user.email || '');
    document.querySelectorAll('.avatar').forEach(e => e.textContent = initials || 'GU');
    if (user.vendor_id) {
      try {
        const vendor = (await apiFetch(`/vendors/${user.vendor_id}`)).vendor;
        document.querySelectorAll('#current-vendor-name,.vendor-name').forEach(e => e.textContent = vendor?.name || '');
      } catch {}
    }
  } catch {}
});
