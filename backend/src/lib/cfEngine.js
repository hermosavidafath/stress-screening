/**
 * Certainty Factor (CF) Engine
 * Metode: Certainty Factor (Shortliffe & Buchanan, 1975)
 * 
 * Rumus CF Kombinasi:
 * CF(A,B) = CF(A) + CF(B) * (1 - CF(A))  → jika keduanya positif
 * CF(A,B) = CF(A) + CF(B) * (1 + CF(A))  → jika keduanya negatif
 * CF(A,B) = (CF(A) + CF(B)) / (1 - min(|CF(A)|, |CF(B)|)) → jika berbeda tanda
 * 
 * CF User: nilai keyakinan user terhadap gejala (0.2, 0.4, 0.6, 0.8, 1.0)
 * CF Pakar: nilai keyakinan pakar terhadap gejala → penyakit
 * CF Gejala = CF_User * CF_Pakar
 */

/**
 * Hitung CF untuk satu gejala
 * @param {number} cfUser - keyakinan user (0-1)
 * @param {number} cfPakar - keyakinan pakar (0-1)
 * @returns {number}
 */
function hitungCFGejala(cfUser, cfPakar) {
  return cfUser * cfPakar;
}

/**
 * Kombinasikan dua nilai CF
 * @param {number} cfA
 * @param {number} cfB
 * @returns {number}
 */
function kombinasiCF(cfA, cfB) {
  if (cfA >= 0 && cfB >= 0) {
    return cfA + cfB * (1 - cfA);
  } else if (cfA < 0 && cfB < 0) {
    return cfA + cfB * (1 + cfA);
  } else {
    return (cfA + cfB) / (1 - Math.min(Math.abs(cfA), Math.abs(cfB)));
  }
}

/**
 * Hitung CF total dari array gejala yang dipilih user
 * @param {Array} gejalaTerpilih - [{gejalaId, cfUser}]
 * @param {Array} aturan - [{id, cfPakar, aturanGejala: [{gejalaId, gejala: {bobot}}]}]
 * @returns {Array} hasil per aturan dengan CF
 */
function hitungCFTotal(gejalaTerpilih, aturan) {
  const hasilAturan = [];

  for (const rule of aturan) {
    // Cek gejala mana yang cocok dengan rule ini
    const gejalaRule = rule.aturanGejala.map(ag => ag.gejalaId);
    const gejalaMatch = gejalaTerpilih.filter(g => gejalaRule.includes(g.gejalaId));

    if (gejalaMatch.length === 0) continue;

    // Hitung CF tiap gejala yang cocok
    const cfGejalaList = gejalaMatch.map(g => {
      const aturanGejala = rule.aturanGejala.find(ag => ag.gejalaId === g.gejalaId);
      const cfPakar = aturanGejala?.gejala?.bobot || 0.5;
      return hitungCFGejala(g.cfUser, cfPakar);
    });

    // Kombinasikan semua CF gejala
    let cfKombinasi = cfGejalaList[0];
    for (let i = 1; i < cfGejalaList.length; i++) {
      cfKombinasi = kombinasiCF(cfKombinasi, cfGejalaList[i]);
    }

    // CF akhir rule = CF kombinasi gejala * CF pakar rule
    const cfAkhir = cfKombinasi * rule.cfPakar;

    hasilAturan.push({
      aturanId: rule.id,
      aturanKode: rule.kode,
      tingkatStresId: rule.tingkatStresId,
      cfAkhir: Math.min(Math.max(cfAkhir, 0), 1), // clamp 0-1
      jumlahGejalaMatch: gejalaMatch.length,
      jumlahGejalaRule: gejalaRule.length,
    });
  }

  // Kelompokkan per tingkat stres, ambil CF tertinggi
  const cfPerTingkat = {};
  for (const hasil of hasilAturan) {
    const tid = hasil.tingkatStresId;
    if (!cfPerTingkat[tid]) {
      cfPerTingkat[tid] = hasil.cfAkhir;
    } else {
      cfPerTingkat[tid] = kombinasiCF(cfPerTingkat[tid], hasil.cfAkhir);
    }
  }

  return {
    hasilAturan,
    cfPerTingkat,
  };
}

/**
 * Tentukan tingkat stres berdasarkan CF tertinggi
 * @param {Object} cfPerTingkat - {tingkatStresId: cfValue}
 * @param {Array} tingkatStresList - data tingkat stres dari DB
 * @returns {Object}
 */
function tentukanHasil(cfPerTingkat, tingkatStresList) {
  let maxCF = 0;
  let tingkatTerpilih = null;

  for (const [tingkatId, cfValue] of Object.entries(cfPerTingkat)) {
    if (cfValue > maxCF) {
      maxCF = cfValue;
      tingkatTerpilih = tingkatStresList.find(t => t.id === parseInt(tingkatId));
    }
  }

  // Jika tidak ada yang match atau CF terlalu rendah
  if (!tingkatTerpilih || maxCF < 0.1) {
    tingkatTerpilih = tingkatStresList.find(t => t.kode === 'RENDAH');
    maxCF = maxCF || 0.1;
  }

  return {
    tingkatStres: tingkatTerpilih,
    nilaiCF: parseFloat(maxCF.toFixed(4)),
    persentaseCF: parseFloat((maxCF * 100).toFixed(2)),
    cfPerTingkat,
  };
}

module.exports = {
  hitungCFGejala,
  kombinasiCF,
  hitungCFTotal,
  tentukanHasil,
};
