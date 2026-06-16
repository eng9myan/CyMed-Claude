/**
 * CyMed ERP Bridge — JSON-RPC client for the ERP engine
 *
 * Talks to the CyMed ERP engine via JSON-RPC. The engine runs as a separate
 * service; this client abstracts all transport details so feature code only
 * sees typed methods like `erp.partner.list()`.
 */

const ERP_URL = process.env.NEXT_PUBLIC_ERP_URL || 'http://localhost:8069';
const ERP_DB  = process.env.NEXT_PUBLIC_ERP_DB  || 'cymed';

let sessionId: string | null = null;
let uid: number | null = null;

interface JsonRpcParams {
  service: string;
  method: string;
  args: unknown[];
}

interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number | null;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

let requestId = 0;

async function jsonRpc<T = unknown>(path: string, params: JsonRpcParams | Record<string, unknown>): Promise<T> {
  const res = await fetch(`${ERP_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'X-Openerp-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params,
      id: ++requestId,
    }),
  });

  const body: JsonRpcResponse<T> = await res.json();
  if (body.error) throw new Error(body.error.data ? JSON.stringify(body.error.data) : body.error.message);
  return body.result as T;
}

export async function login(username: string, password: string): Promise<number> {
  const result = await jsonRpc<{ uid: number; session_id?: string }>('/web/session/authenticate', {
    db: ERP_DB,
    login: username,
    password,
  });
  uid = result.uid;
  sessionId = result.session_id ?? null;
  return result.uid;
}

export async function logout(): Promise<void> {
  await jsonRpc('/web/session/destroy', {});
  uid = null;
  sessionId = null;
}

export function isAuthenticated(): boolean {
  return uid !== null;
}

/**
 * Generic ORM call — equivalent to executing an ORM method on the server.
 * Example: callKw('res.partner', 'search_read', [[['is_company', '=', true]]], { fields: ['name'] })
 */
export async function callKw<T = unknown>(
  model: string,
  method: string,
  args: unknown[] = [],
  kwargs: Record<string, unknown> = {},
): Promise<T> {
  return jsonRpc<T>('/web/dataset/call_kw', {
    model,
    method,
    args,
    kwargs,
  });
}

/** Read records matching a domain. */
export async function searchRead<T = Record<string, unknown>>(
  model: string,
  domain: unknown[] = [],
  fields: string[] = [],
  options: { limit?: number; offset?: number; order?: string } = {},
): Promise<T[]> {
  return callKw<T[]>(model, 'search_read', [domain, fields], options);
}

/** Read specific record IDs. */
export async function read<T = Record<string, unknown>>(
  model: string,
  ids: number[],
  fields: string[] = [],
): Promise<T[]> {
  return callKw<T[]>(model, 'read', [ids, fields]);
}

/** Create a new record. Returns the new ID. */
export async function create(model: string, values: Record<string, unknown>): Promise<number> {
  return callKw<number>(model, 'create', [values]);
}

/** Update existing records. */
export async function write(model: string, ids: number[], values: Record<string, unknown>): Promise<boolean> {
  return callKw<boolean>(model, 'write', [ids, values]);
}

/** Delete records. */
export async function unlink(model: string, ids: number[]): Promise<boolean> {
  return callKw<boolean>(model, 'unlink', [ids]);
}

/** Trigger a server action (e.g. confirm an order, post a journal). */
export async function action(model: string, method: string, ids: number[], kwargs: Record<string, unknown> = {}): Promise<unknown> {
  return callKw(model, method, [ids], kwargs);
}
