import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Is this user an emergency contact for someone?
    const asContact = await base44.asServiceRole.entities.Linkage.filter({
      contact_user_id: user.id,
      status: 'active'
    });
    const contactList = asContact && asContact.items ? asContact.items : asContact;
    if (contactList && contactList.length) {
      const link = contactList[0];
      return Response.json({
        role: 'contact',
        patient_name: link.patient_name || 'Paciente',
        main_user_id: link.created_by_id
      });
    }

    // Otherwise treat as a patient (main user). Return their pending code if any.
    const asPatient = await base44.asServiceRole.entities.Linkage.filter({
      created_by_id: user.id,
      status: 'pending'
    });
    const patientList = asPatient && asPatient.items ? asPatient.items : asPatient;
    let link_code = null;
    if (patientList && patientList.length) link_code = patientList[0].code;

    return Response.json({
      role: 'patient',
      link_code,
      patient_name: user.full_name || ''
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}