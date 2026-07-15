export async function getPatients() {
  const res = await fetch("http://localhost:3003/api/auth/patients", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch patients");
  }

  return res.json();
}