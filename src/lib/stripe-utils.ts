export const safeStripeDate = (timestamp: number | null | undefined): string | null => {
    if (!timestamp) return null;
    try {
        const date = new Date(timestamp * 1000);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
    } catch (e) {
        return null;
    }
};

export const stripeDateToISO = (timestamp: number | null | undefined): string => {
    return safeStripeDate(timestamp) || new Date().toISOString();
};
