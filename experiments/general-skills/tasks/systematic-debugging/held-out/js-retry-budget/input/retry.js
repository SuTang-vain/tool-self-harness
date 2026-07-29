export async function retry(operation, maxAttempts) {
  let lastError;
  for (let attempt = 0; attempt <= maxAttempts; attempt++) {
    try { return await operation(attempt + 1); }
    catch (error) { lastError = error; }
  }
  throw lastError;
}
