// -- Permissions / Rights Service ---------------------------
// Manages the permission-node tree and per-user / per-role grants.
import { query } from '../config/database.js';

interface NodeRow {
  id: string;
  label: string;
  parent_id: string | null;
  sort_order: number;
}

export interface PermissionNode {
  id: string;
  label: string;
  children?: PermissionNode[];
}

function buildTree(rows: NodeRow[]): PermissionNode[] {
  type InternalNode = PermissionNode & { parent_id: string | null };
  const byId = new Map<string, InternalNode>();
  for (const r of rows) {
    byId.set(r.id, { id: r.id, label: r.label, parent_id: r.parent_id, children: [] });
  }
  const roots: InternalNode[] = [];
  for (const r of rows) {
    const node = byId.get(r.id);
    if (!node) continue;
    const parent = r.parent_id ? byId.get(r.parent_id) : undefined;
    if (parent) parent.children!.push(node);
    else roots.push(node);
  }
  // Strip empty children arrays + parent_id helpers before returning.
  const strip = (nodes: InternalNode[]) => {
    for (const n of nodes) {
      delete (n as { parent_id?: string | null }).parent_id;
      if (n.children && n.children.length === 0) delete n.children;
      else if (n.children) strip(n.children as InternalNode[]);
    }
  };
  strip(roots);
  return roots;
}

export const PermissionService = {
  /** List all nodes as a hierarchical tree */
  async listNodes(): Promise<PermissionNode[]> {
    const r = await query(
      `SELECT id, label, parent_id, sort_order FROM permission_nodes
       ORDER BY sort_order ASC, label ASC`,
    );
    return buildTree(r.rows as NodeRow[]);
  },

  /** Upsert a permission node (id stable — e.g. 'ship_view') */
  async upsertNode(id: string, label: string, parentId: string | null = null, sortOrder = 0) {
    await query(
      `INSERT INTO permission_nodes (id, label, parent_id, sort_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label,
         parent_id = EXCLUDED.parent_id, sort_order = EXCLUDED.sort_order`,
      [id, label, parentId, sortOrder],
    );
  },

  async deleteNode(id: string) {
    await query('DELETE FROM permission_nodes WHERE id = $1', [id]);
  },

  /** Get flat list of node ids granted to a user */
  async getUserPermissions(userId: string): Promise<string[]> {
    const r = await query(
      `SELECT node_id FROM user_permissions WHERE user_id = $1`,
      [userId],
    );
    return (r.rows as Array<{ node_id: string }>).map((x) => x.node_id);
  },

  /** Replace a user's permission set with the given list (atomic) */
  async setUserPermissions(userId: string, nodeIds: string[]) {
    await query('BEGIN');
    try {
      await query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);
      if (nodeIds.length > 0) {
        const values = nodeIds.map((_, i) => `($1, $${i + 2})`).join(', ');
        await query(
          `INSERT INTO user_permissions (user_id, node_id) VALUES ${values}
           ON CONFLICT DO NOTHING`,
          [userId, ...nodeIds],
        );
      }
      await query('COMMIT');
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  },

  /** Get flat list of node ids granted to a role */
  async getRolePermissions(roleName: string): Promise<string[]> {
    const r = await query(
      `SELECT node_id FROM role_permissions WHERE role_name = $1`,
      [roleName],
    );
    return (r.rows as Array<{ node_id: string }>).map((x) => x.node_id);
  },

  /** Replace a role's permission set with the given list (atomic) */
  async setRolePermissions(roleName: string, nodeIds: string[]) {
    await query('BEGIN');
    try {
      await query('DELETE FROM role_permissions WHERE role_name = $1', [roleName]);
      if (nodeIds.length > 0) {
        const values = nodeIds.map((_, i) => `($1, $${i + 2})`).join(', ');
        await query(
          `INSERT INTO role_permissions (role_name, node_id) VALUES ${values}
           ON CONFLICT DO NOTHING`,
          [roleName, ...nodeIds],
        );
      }
      await query('COMMIT');
    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }
  },

  async listRoles(): Promise<string[]> {
    const r = await query(
      `SELECT DISTINCT role_name FROM role_permissions
       UNION SELECT DISTINCT role_name FROM users WHERE role_name IS NOT NULL
       ORDER BY 1 ASC`,
    );
    return (r.rows as Array<{ role_name: string }>).map((x) => x.role_name);
  },
};
