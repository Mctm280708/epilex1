import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { randomCode, normalizeCode } from '../../shared/linkage.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Reuse an existing pending code so the patient always has one stable code to share.
    const existing = await base44.asServiceRole.entities.Linkage.filter({
      created_by_id: user.id,
      status: 'pending'
    });
    const existingList = existing && existing.items ? existing.items : existing;
    if (existingList && existingList.length) {
      return Response.json({ code: existingList[0].code });
    }

    const code = randomCode();
    await base44.asServiceRole.entities.Linkage.create({
      code,
      main_user_email: user.email || '',
      patient_name: user.full_name || '',
      contact_user_id: '',
      contact_email: '',
      status: 'pending'
    });
    return Response.json({ code });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}