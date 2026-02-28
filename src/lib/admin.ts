export const ADMIN_EMAILS = [
    'akobiabiola0@gmail.com',
    'hakim.digital05@gmail.com'
];

export function isAdmin(email?: string) {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
}
