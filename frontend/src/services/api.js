const TOKEN_KEY = "medikiosk-auth-token";
const API_BASE = import.meta.env.VITE_API_URL || "/api";
export function getToken(){ return localStorage.getItem(TOKEN_KEY); }
export function setToken(token){ localStorage.setItem(TOKEN_KEY, token); }
export function clearToken(){ localStorage.removeItem(TOKEN_KEY); }
export async function api(path, options={}){ const headers={"Content-Type":"application/json",...(options.headers||{})}; const token=getToken(); if(token) headers.Authorization=`Bearer ${token}`; const res=await fetch(`${API_BASE}${path}`,{...options,headers}); const data=await res.json().catch(()=>({})); if(!res.ok) throw new Error(data.error||`Request failed (${res.status})`); return data; }
export async function login(email,password){ const data=await api("/auth/login",{method:"POST",body:JSON.stringify({email,password})}); setToken(data.token); return data; }
export async function register(payload){ const data=await api("/auth/register",{method:"POST",body:JSON.stringify(payload)}); setToken(data.token); return data; }
export async function saveProfile(payload){ return api("/profile",{method:"PUT",body:JSON.stringify(payload)}); }
export function logout(){ clearToken(); }
