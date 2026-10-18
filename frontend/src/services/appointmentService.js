import { api } from "./api.js";
export async function getAppointments(){ const {appointments}=await api("/appointments"); return appointments; }
export async function createAppointment(input){ const {appointment}=await api("/appointments",{method:"POST",body:JSON.stringify(input)}); return appointment; }
export async function cancelAppointment(id){ const {appointment}=await api(`/appointments/${id}/cancel`,{method:"PATCH"}); return appointment; }
