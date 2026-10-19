import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find active linkages created by this patient
    const linksRes = await base44.asServiceRole.entities.Linkage.filter({
      created_by_id: user.id,
      status: 'active'
    });
    const links = linksRes && linksRes.items ? linksRes.items : (linksRes || []);

    if (!links || !links.length) {
      return Response.json({ error: 'Nenhum contato vinculado ativo.' }, { status: 404 });
    }

    let revoked = 0;
    for (const link of links) {
      await base44.asServiceRole.entities.Linkage.delete(link.id);
      revoked++;
    }

    return Response.json({ success: true, revoked });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}