import { getAuthUser } from '@jerry/utils/auth';
import { createResource, getResources } from '@jerry/utils/resource';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) {
    return NextResponse.json({message: 'Unauthenticated'}, {status: 403})
  }
  const resources = await getResources()
  return NextResponse.json({resources}, {status: 200})
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user || !user.isAdmin) {
    return NextResponse.json({message: 'Unauthorized'}, {status: 403})
  }

  try {
    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({message: "Name is required"}, {status: 400})
    }
    const {name, description, defaultClaimTime} = body
    const resourceId = await createResource({name, description, default_claim_time: defaultClaimTime})
    return NextResponse.json({id: resourceId, name, description, defaultClaimTime}, {status: 200})
  } catch (e) {
    console.error('Failed to create resource', e)
    return NextResponse.json({message: 'Failed to create resource'}, {status: 400})
  }

}