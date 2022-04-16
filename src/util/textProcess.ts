export function processId(id: string): string {
  if (!id) {
    return null;
  }
  return id.toString();
}

export function processEmail(email: string) {
  const re = /\S+@\S+\.\S+/;
  return re.test(String(email).toLowerCase());
}
