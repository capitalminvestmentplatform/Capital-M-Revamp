import { NextRequest } from "next/server";
import { createUser, getUsers } from "./handlers";

export async function GET() {
  return getUsers();
}
export async function POST(req: NextRequest) {
  return createUser(req);
}
