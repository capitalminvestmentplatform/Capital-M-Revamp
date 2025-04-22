import { createUser, getUsers } from "./handlers";

export async function GET() {
  return getUsers();
}
export async function POST(req: Request) {
  return createUser(req);
}
