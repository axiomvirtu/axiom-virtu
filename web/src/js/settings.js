import { db } from './firebase.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('wallet-form');
  if (!form) return;

  const btnSave = document.getElementById('btn-save-wallet');
  const inputUsdtTrc20 = document.getElementById('wallet-usdt-trc20');
  const inputUsdtErc20 = document.getElementById('wallet-usdt-erc20');
  const inputBtc = document.getElementById('wallet-btc');

  // Reference to the single settings document
  const settingsDocRef = doc(db, 'app_settings', 'wallets');

  // Load existing data
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      inputUsdtTrc20.value = data.usdt_trc20 || '';
      inputUsdtErc20.value = data.usdt_erc20 || '';
      inputBtc.value = data.btc || '';
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }

  // Save data
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    btnSave.disabled = true;
    const originalText = btnSave.innerText;
    btnSave.innerText = 'Menyimpan...';

    try {
      await setDoc(settingsDocRef, {
        usdt_trc20: inputUsdtTrc20.value.trim(),
        usdt_erc20: inputUsdtErc20.value.trim(),
        btc: inputBtc.value.trim(),
        updatedAt: new Date().toISOString()
      }, { merge: true }); // merge true so we don't overwrite other fields if they exist

      alert('Pengaturan dompet berhasil disimpan!');
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Gagal menyimpan pengaturan: ' + error.message);
    } finally {
      btnSave.disabled = false;
      btnSave.innerText = originalText;
    }
  });
});
