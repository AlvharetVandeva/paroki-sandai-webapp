import { getAllPersons } from "@/services/person.service";
import { getAllRoles } from "@/services/service-role.service";
import { PersonsClient } from "./persons-client";

export default async function PersonsPage() {
  const [persons, roles] = await Promise.all([getAllPersons(), getAllRoles()]);
  return <PersonsClient persons={persons} roles={roles} />;
}
