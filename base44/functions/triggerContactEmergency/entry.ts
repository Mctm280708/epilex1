import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify this user is an active emergency contact
    const links = await base44.asServiceRole.entities.Linkage.filter({
      contact_user_id: user.id,
      status: 'active'
    });
    const linkList = links && links.items ? links.items : (links || []);
    if (!linkList || !linkList.length) {
      return Response.json({ error: 'Você não tem permissão.' }, { status: 403 });
    }
    const link = linkList[0];
    const patientId = link.created_by_id;

    const body = await req.json().catch(() => ({}));
    const { severity, message, location } = body;
    const alertDateTime = new Date().toISOString();
    const sev = severity || 'moderada';
    const msg = message || `Acionamento de emergência pelo contato ${user.full_name || user.email || ''}`;
    const loc = location || '';

    // Create Alert as the patient (service role) so the patient can see it
    const alert = await base44.asServiceRole.entities.Alert.create({
      crisis_id: null,
      severity: sev,
      message: msg,
      location: loc,
      date_time: alertDateTime,
      alert_type: 'manual',
      created_by_id: patientId
    });

    // Email the patient
    const patientName = link.patient_name || 'Paciente';
    const formattedDate = new Date(alertDateTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    let emailsSent = 0;
    if (link.main_user_email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: link.main_user_email,
          template_name: 'CrisisAlert',
          variables: {
            patient_name: patientName,
            severity: sev,
            alert_message: msg,
            location: loc || 'Não disponível',
            date_time: formattedDate,
            app_url: 'https://epilex-safe-link.base44.app',
            recipient_role: 'paciente'
          }
        });
        emailsSent++;
      } catch (e) {}
    }

    return Response.json({
      success: true,
      alert_id: alert ? alert.id : null,
      recipients: emailsSent
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}