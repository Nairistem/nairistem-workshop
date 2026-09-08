import type { Order } from '../types/workshop';

/**
 * Normalizes Indonesian phone numbers to standard 628xx format
 * Example: "0812-3456-7890" -> "6281234567890"
 */
export function normalizeIndonesianPhone(phone: string): string {
  if (!phone) return '';
  // Remove all non-digits
  let clean = phone.replace(/\D/g, '');
  
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (clean.startsWith('8')) {
    clean = '628' + clean.slice(1);
  } else if (!clean.startsWith('62') && clean.length > 5) {
    clean = '62' + clean;
  }
  return clean;
}

/**
 * Generates direct wa.me link with prefilled message
 */
export function createWhatsAppLink(phone: string, message: string): string {
  const normalizedPhone = normalizeIndonesianPhone(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

export function generateTrackingMessage(order: Order, originUrl: string): string {
  const cleanPlate = order.plateNumber.replace(/\s+/g, '').toUpperCase();
  const trackingUrl = `${originUrl}/track/${cleanPlate}`;
  
  return `Halo Kak ${order.customerName},\n\nTerima kasih telah mempercayakan kendaraan Kakak di *NAIRISTEM Detailing Lab* 🚗✨\n\n*Detail Pengerjaan:*\n• No. SPK: ${order.spkNumber}\n• Unit: ${order.vehicleModel} (${order.vehicleColor})\n• No. Plat: ${order.plateNumber}\n• Layanan: ${order.servicePackage}\n• Lead Detailer: ${order.technicianName}\n\nKakak dapat memantau progres pengerjaan & foto inspeksi awal mobil secara live melalui tautan digital concierge kami:\n👉 ${trackingUrl}\n\nKami akan menginfokan kembali saat kendaraan sudah selesai dan siap diambil. Terima kasih!`;
}

export function generateCompletionMessage(order: Order, originUrl: string): string {
  const cleanPlate = order.plateNumber.replace(/\s+/g, '').toUpperCase();
  const trackingUrl = `${originUrl}/track/${cleanPlate}`;

  return `Kabar Baik Kak ${order.customerName}! 🎉\n\nPengerjaan detailing mobil Kakak (*${order.vehicleModel} - ${order.plateNumber}*) telah *SELESAI* & lolos Quality Control 100% ✨\n\nUnit saat ini sudah diparkir di delivery bay kami dan siap untuk diambil.\n\n*Ringkasan Transaksi:*\n• Total Jasa: Rp ${order.finalTotal.toLocaleString('id-ID')}\n• Status Pembayaran: ${order.paymentStatus === 'paid' ? 'LUNAS' : 'Belum Lunas'}\n\nLihat hasil akhir pengerjaan & resume SPK di:\n👉 ${trackingUrl}\n\nDitunggu kedatangannya di NAIRISTEM Detailing Lab!`;
}
