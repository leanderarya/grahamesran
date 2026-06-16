export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDateTime(isoString: string | null | undefined): string {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatCurrency(amount: number): string {
    return `Rp ${formatRupiah(amount)}`;
}

export function formatVolume(value: number | string | null | undefined): string | null {
    const numeric = Number(value);
    if (!numeric) return null;
    return `${numeric.toString().replace(/\.0+$/, '')}L`;
}

export function getProductLabel(product: { name: string; volume_liter?: number | string | null } | null | undefined): string {
    if (!product) return '';
    const volume = formatVolume(product.volume_liter);
    return volume ? `${product.name} (${volume})` : product.name;
}
