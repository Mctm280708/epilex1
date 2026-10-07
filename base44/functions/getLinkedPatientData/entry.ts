import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const links = await base44.asServiceRole.entities.Linkage.filter({
      contact_user_id: user.id,
      status: 'active'
    });
    const linkList = links && links.items ? links.items : links;
    if (!linkList || !linkList.length) {
      return Response.json({ error: 'Você não tem permissão para acessar estes dados.' }, { status: 403 });
    }
    const link = linkList[0];
    const mainUserId = link.created_by_id;

    const [crisesRes, profilesRes] = await Promise.all([
      base44.asServiceRole.entities.CrisisEvent.filter(
        { created_by_id: mainUserId },
        { sort: '-date_time', limit: 200 }
      ),
      base44.asServiceRole.entities.MedicalProfile.filter(
        { created_by_id: mainUserId },
        { limit: 1 }
      )
    ]);

    const crises = crisesRes && crisesRes.items ? crisesRes.items : (crisesRes || []);
    const profileList = profilesRes && profilesRes.items ? profilesRes.items : (profilesRes || []);

    return Response.json({
      patient_name: link.patient_name || 'Paciente',
      main_user_email: link.main_user_email || '',
      crises,
      medical_profile: profileList[0] || null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}