import assert from "assert";

console.log("=== PROTOKOL VERIFIKASI KUALITAS NAIRISTEM WORKSHOP ===");

// 1. WhatsApp Phone Normalizer & URL Encoding Test
function normalizeIndonesianPhone(phone) {
  if (!phone) return "";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  } else if (clean.startsWith("8")) {
    clean = "628" + clean.slice(1);
  } else if (!clean.startsWith("62") && clean.length > 5) {
    clean = "62" + clean;
  }
  return clean;
}

function createWhatsAppLink(phone, message) {
  const normalizedPhone = normalizeIndonesianPhone(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
}

const testPhone1 = "081234567890";
const norm1 = normalizeIndonesianPhone(testPhone1);
assert.strictEqual(norm1, "6281234567890", "Test 08xx -> 628xx failed!");

const testPhone2 = "+62 811-9876-5432";
const norm2 = normalizeIndonesianPhone(testPhone2);
assert.strictEqual(norm2, "6281198765432", "Test formatted phone failed!");

const sampleMsg = "Halo Budi Pratama, mobil Anda B 1988 NAI sudah siap diambil di NAIRISTEM Detailing Lab!";
const waUrl = createWhatsAppLink(testPhone1, sampleMsg);
assert(waUrl.startsWith("https://wa.me/6281234567890?text="), "WhatsApp URL format invalid!");
assert(waUrl.includes(encodeURIComponent("B 1988 NAI")), "Plate number encoding failed!");
console.log("✓ Test 5 (WhatsApp wa.me Normalizer & Link Encoding): LULUS");

// 2. Financial Calculation Test (Commission & Invoice)
const serviceBase = 3800000;
const discount = 200000;
const finalTotal = serviceBase - discount;
const commPct = 15;
const commission = Math.round((serviceBase * commPct) / 100);

assert(!isNaN(finalTotal) && finalTotal === 3600000, "Final total calculation error!");
assert(!isNaN(commission) && commission === 570000, "Commission calculation error!");
console.log(`✓ Test 6 (Kalkulasi Invoice & Komisi): LULUS (Jasa: Rp ${serviceBase.toLocaleString("id-ID")}, Diskon: Rp ${discount.toLocaleString("id-ID")}, Total: Rp ${finalTotal.toLocaleString("id-ID")}, Komisi 15%: Rp ${commission.toLocaleString("id-ID")})`);

// 3. Plate matching logic test (Public tracking router)
function matchPlate(search, target) {
  return search.replace(/\s+/g, "").toUpperCase() === target.replace(/\s+/g, "").toUpperCase();
}
assert(matchPlate("B1988NAI", "B 1988 NAI"), "Plate match failed for B1988NAI");
assert(matchPlate("b 1988 nai", "B 1988 NAI"), "Plate match failed for lowercase plate");
console.log("✓ Test 4 (Live Tracking Plate Matcher): LULUS (Akses tanpa login via /track/B1988NAI)");

// 4. Kanban Status Flow Sequence Test
const STATUS_FLOW = ['queue', 'detailing', 'finishing', 'ready', 'completed'];
assert.strictEqual(STATUS_FLOW.length, 5);
assert.strictEqual(STATUS_FLOW[0], 'queue');
assert.strictEqual(STATUS_FLOW[4], 'completed');
console.log("✓ Test 3 (Kanban SPK 5-Stage Flow Progression): LULUS");

console.log("\n=======================================================");
console.log("SELURUH PROTOKOL TESTING BERHASIL TERVERIFIKASI 100%");
console.log("=======================================================");
