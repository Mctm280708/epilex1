import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

const FIREBASE_URL = 'https://dourado-3e4ed-default-rtdb.firebaseio.com';
const SENSOR_PATH = 'eplex/ultima_leitura';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = secrets.get('FIREBASE_DATABASE_SECRET');
    if (!secret) return Response.json({ error: 'Firebase secret não configurado' }, { status: 500 });

    const url = `${FIREBASE_URL}/${SENSOR_PATH}.json?auth=${secret}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      const body = await res.text();
      return Response.json({ error: `Firebase retornou ${res.status}: ${body}` }, { status: 502 });
    }

    const data = await res.json();
    if (data === null) {
      return Response.json({ error: 'Nenhum dado encontrado no caminho eplex/ultima_leitura' }, { status: 404 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}