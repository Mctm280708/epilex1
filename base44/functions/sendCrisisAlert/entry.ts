import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { crisis_id, severity, message, location, date_time, alert_type } = body;

    const alertDateTime = date_time || new Date().toISOString();
    const sev = severity || 'moderada';
    const msg = message || 'Crise epiléptica detectada pela pulseira EPILEX';
    const loc = location || '';
    const aType = alert_type || 'crise_detectada';
    const patientName = user.full_name || user.email || 'Paciente';

    // Create Alert record as the patient (so RLS allows the patient to see it)
    const alert = await base44.entities.Alert.create({
      crisis_id: crisis_id || null,
      severity: sev,
      message: msg,
      location: loc,
      date_time: alertDateTime,
      alert_type: aType
    });

    // Find active linked contacts
    const linksRes = await base44.asServiceRole.entities.Linkage.filter({
      created_by_id: user.id,
      status: 'active'
    });
    const links = linksRes && linksRes.items ? linksRes.items : (linksRes || []);

    const formattedDate = new Date(alertDateTime).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    const emailVars = {
      patient_name: patientName,
      severity: sev,
      alert_message: msg,
      location: loc || 'Não disponível',
      date_time: formattedDate,
      app_url: 'https://epilex-safe-link.base44.app'
    };

    let emailsSent = 0;

    // Email the patient
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        template_name: 'CrisisAlert',
        variables: { ...emailVars, recipient_role: 'paciente' }
      });
      emailsSent++;
    } catch (e) {}

    // Email each linked emergency contact
    for (const link of links) {
      const contactEmail = link.contact_email;
      if (!contactEmail) continue;
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: contactEmail,
          template_name: 'CrisisAlert',
          variables: { ...emailVars, recipient_role: 'contato de emergência' }
        });
        emailsSent++;
      } catch (e) {}
    }

    return Response.json({
      success: true,
      alert_id: alert ? alert.id : null,
      recipients: emailsSent,
      contacts_notified: links.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}