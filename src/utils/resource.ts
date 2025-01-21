import { ResourceInfo } from '@jerry/types/resource';
import { sql } from './db';

export interface ResourceInfoRow {
  id: string
  name: string
  description?: string
  expires?: number;
  user_id?: string
  email?: string
  user_name?: string
  avatar_url?: string
  is_admin?: boolean
}

export async function getResources() {
  const resources = await sql<ResourceInfoRow[]>`
    SELECT
      r.id,
      r.name,
      r.description,
      c.user_id,
      c.expires,
      u.email,
      u.user_name,
      u.avatar_url,
      u.is_admin
    FROM "resource" r
      LEFT JOIN "claim" c on "claim"."resource_id" = "resource"."id" AND "claim"."is_active" AND "claim"."expires" > ${Date.now()}
      LEFT JOIN "user" u on c.user_id = u.id
    ;
  `
  const resourceInfos: ResourceInfo[]  = resources.map(({id, name, description, expires, ...claimant}) => ({
    id,
    name,
    description,
    expires: expires != null ? new Date(expires) : undefined,
    claimant: claimant != null ? {
      id: claimant.user_id!,
      email: claimant.email!,
      name: claimant.user_name,
      avatar: claimant.avatar_url,
      isAdmin: claimant.is_admin!,
    } : undefined
  }))

  return resourceInfos
}

export async function createResource({name, description, default_claim_time}: {name: string, description?: string; default_claim_time?: number}) {
  const [id] = await sql`Insert into "resource" ("name", "description", "default_claim_time") VALUES (${name}, ${description ?? null}, ${default_claim_time ?? null}) RETURNING id;`
  return id
}