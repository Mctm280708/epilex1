import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  appBaseUrl
});

// Send a crisis alert to the patient's single linked emergency contact.
export async function notifyEmergencyContact(data) {
  return base44.functions.invoke('sendCrisisAlert', data);
}

// Send a crisis alert to the patient and all linked emergency contacts simultaneously.
export async function notifyEmergencyContacts(data) {
  return base44.functions.invoke('sendCrisisAlert', data);
}