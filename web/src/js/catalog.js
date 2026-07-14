import { db } from './firebase.js';
import { collection, addDoc, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  // Hanya jalankan jika ada di halaman catalog
  if (!document.getElementById('catalog-table-body')) return;

  const modalOverlay = document.getElementById('modal-overlay');
  const btnOpenModal = document.getElementById('btn-open-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const formAddCatalog = document.getElementById('form-add-catalog');
  const tableBody = document.getElementById('catalog-table-body');
  const btnSave = document.getElementById('btn-save-catalog');
  const modalTitle = document.querySelector('#modal-overlay h3');

  let editId = null;

  // Modal Toggles
  const openModal = () => {
    editId = null;
    if (modalTitle) modalTitle.innerText = 'Tambah Katalog Baru';
    btnSave.innerText = 'Simpan Katalog';
    modalOverlay.classList.remove('hidden');
    formAddCatalog.reset();
  };
  const closeModal = () => modalOverlay.classList.add('hidden');

  btnOpenModal.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  // Close modal when clicking outside
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Handle Form Submit (Add/Edit Data)
  formAddCatalog.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable button to prevent double submit
    btnSave.disabled = true;
    btnSave.innerText = "Menyimpan...";

    try {
      const name = document.getElementById('cat-name').value;
      const desc = document.getElementById('cat-desc').value;
      const limitMin = Number(document.getElementById('cat-limit-min').value);
      const limitMax = Number(document.getElementById('cat-limit-max').value);
      const status = document.getElementById('cat-status').value;

      if (editId) {
        await updateDoc(doc(db, 'asset_catalogs', editId), {
          name,
          description: desc,
          capital_min: limitMin,
          capital_max: limitMax,
          capitalLimit: limitMin, // Fallback for old compatibility
          status,
          updatedAt: new Date().toISOString()
        });
        closeModal();
        alert('Katalog berhasil diperbarui!');
      } else {
        await addDoc(collection(db, 'asset_catalogs'), {
          name,
          description: desc,
          capital_min: limitMin,
          capital_max: limitMax,
          capitalLimit: limitMin, // Fallback for old compatibility
          status,
          createdAt: new Date().toISOString()
        });
        closeModal();
        alert('Katalog berhasil ditambahkan!');
      }
    } catch (error) {
      console.error("Error saving document: ", error);
      alert('Gagal menyimpan katalog: ' + error.message);
    } finally {
      btnSave.disabled = false;
      btnSave.innerText = editId ? "Perbarui Katalog" : "Simpan Katalog";
    }
  });

  // Render Table Data (Realtime)
  const q = query(collection(db, 'asset_catalogs'), orderBy('createdAt', 'desc'));
  
  onSnapshot(q, (snapshot) => {
    tableBody.innerHTML = ''; // Kosongkan tabel
    
    if (snapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="py-8 text-center text-gray-500">Belum ada katalog.</td>
        </tr>
      `;
      return;
    }

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;
      
      const statusBadge = data.status === 'active' 
        ? `<span class="px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20">Aktif</span>`
        : `<span class="px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs font-medium border border-gray-500/20">Draft</span>`;

      const capitalMin = data.capital_min ?? data.capitalLimit ?? 0;
      const capitalMax = data.capital_max ?? data.capitalLimit ?? 0;
      const capitalDisplay = `${capitalMin.toLocaleString()} USDT`;

      const tr = document.createElement('tr');
      tr.className = 'border-b border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors';
      tr.innerHTML = `
        <td class="py-4 px-6 text-sm font-medium text-white">${data.name}</td>
        <td class="py-4 px-6 text-sm text-gray-400 font-mono">${capitalDisplay}</td>
        <td class="py-4 px-6 text-sm">${statusBadge}</td>
        <td class="py-4 px-6 text-sm text-right">
          <div class="flex items-center justify-end gap-2" id="action-td-${id}"></div>
        </td>
      `;
      
      const actionTd = tr.querySelector(`#action-td-${id}`);
      
      const editBtn = document.createElement('button');
      editBtn.className = 'p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors';
      editBtn.title = 'Edit';
      editBtn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>`;
      editBtn.addEventListener('click', () => {
        editId = id;
        document.getElementById('cat-name').value = data.name;
        document.getElementById('cat-desc').value = data.description || '';
        document.getElementById('cat-limit-min').value = data.capital_min ?? data.capitalLimit ?? 0;
        document.getElementById('cat-limit-max').value = data.capital_max ?? data.capitalLimit ?? 0;
        document.getElementById('cat-status').value = data.status || 'active';
        if (modalTitle) modalTitle.innerText = 'Edit Katalog';
        btnSave.innerText = 'Perbarui Katalog';
        modalOverlay.classList.remove('hidden');
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors';
      deleteBtn.title = 'Hapus';
      deleteBtn.innerHTML = `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Apakah Anda yakin ingin menghapus katalog "${data.name}"?`)) {
          try {
            await deleteDoc(doc(db, 'asset_catalogs', id));
          } catch (error) {
            console.error("Error deleting document: ", error);
            alert('Gagal menghapus katalog: ' + error.message);
          }
        }
      });
      
      actionTd.appendChild(editBtn);
      actionTd.appendChild(deleteBtn);

      tableBody.appendChild(tr);
    });
  }, (error) => {
    console.error("Gagal mendengarkan data katalog:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="py-8 text-center text-red-500">Terjadi kesalahan saat memuat data. Pastikan aturan Firestore mengizinkan akses.</td>
      </tr>
    `;
  });
});
