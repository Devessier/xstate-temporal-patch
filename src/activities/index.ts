export async function getUserInformation(): Promise<{ name: string }> {
  console.log('Get user information');

  return {
    name: 'John State',
  };
}

export async function billUser(): Promise<void> {
  console.log('Bill user');
}

export async function sendEmail(): Promise<void> {
  console.log('Send email to user');
}
