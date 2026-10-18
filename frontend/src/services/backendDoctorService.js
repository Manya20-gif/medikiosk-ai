import { api } from "./api.js";
export async function getDoctors(){ const {doctors}=await api("/doctors"); return doctors; }
export async function getDoctorByIdRemote(id){ const {doctor}=await api(`/doctors/${id}`); return doctor; }
