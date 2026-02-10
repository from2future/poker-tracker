export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown Date';
    try {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
        }).format(new Date(dateString));
    } catch (e) {
        return 'Invalid Date';
    }
};
