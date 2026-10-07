import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { normalizeCode } from '../../shared/linkage.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = normalizeCode(body && body.code);
    if (!code) return Response.json({ error: 'Código de vinculação inválido.' }, { status: 400 });

    const found = await base44.asServiceRole.entities.Linkage.filter({
      code,
      status: 'pending'
    });
    const foundList = found && found.items ? found.items : found;
    if (!foundList || !foundList.length) {
      return Response.json({ error: 'Código não encontrado ou já utilizado.' }, { status: 404 });
    }
    const link = foundList[0];

    if (link.created_by_id === user.id) {
      return Response.json({ error: 'Você não pode usar o seu próprio código.' }, { status: 400 });
    }

    const already = await base44.asServiceRole.entities.Linkage.filter({
      contact_user_id: user.id,
      status: 'active'
    });
    const alreadyList = already && already.items ? already.items : already;
    if (alreadyList && alreadyList.length) {
      return Response.json({ error: 'Você já está vinculado a um paciente.' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Linkage.update(link.id, {
      contact_user_id: user.id,
      contact_email: user.email || '',
      status: 'active'
    });

    return Response.json({
      ok: true,
      patient_name: link.patient_name || 'Paciente',
      main_user_id: link.created_by_id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}