function getAnimals() {
    return JSON.parse(localStorage.getItem('animals')) || [];
}

function saveAnimals(animals) {
    localStorage.setItem('animals', JSON.stringify(animals));
}

function getVaccinations() {
    return JSON.parse(localStorage.getItem('vaccinations')) || [];
}

function saveVaccinations(vaccinations) {
    localStorage.setItem('vaccinations', JSON.stringify(vaccinations));
}

function generateAnimalId() {
    const animals = getAnimals();
    const num = animals.length + 1;
    return 'ANM' + String(num).padStart(3, '0');
}

function generateVaccId() {
    const vaccinations = getVaccinations();
    const num = vaccinations.length + 1;
    return 'VAC' + String(num).padStart(3, '0');
}

function calculateStatus(scheduledDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduled = new Date(scheduledDate);
    scheduled.setHours(0, 0, 0, 0);
    const diff = (scheduled - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'due_today';
    return 'upcoming';
}

function updateAllStatuses() {
    let vaccinations = getVaccinations();
    vaccinations = vaccinations.map(v => {
        if (v.status !== 'completed') {
            v.status = calculateStatus(v.scheduledDate);
        }
        return v;
    });
    saveVaccinations(vaccinations);
}

const vaccineMap = {
    cow:     ['FMD Vaccine', 'Brucellosis', 'Anthrax', 'Blackleg', 'BVD'],
    buffalo: ['FMD Vaccine', 'Brucellosis', 'Anthrax', 'Blackleg', 'BVD'],
    goat:    ['PPR Vaccine', 'Goat Pox', 'Enterotoxaemia', 'Rabies'],
    sheep:   ['Foot Rot', 'Pasteurellosis', 'Clostridial', 'Rabies']
};

function loadDashboard() {
    if (!document.getElementById('tnum')) return;

    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toDateString();
    }

    updateAllStatuses();

    const animals = getAnimals();
    const vaccinations = getVaccinations();

    document.getElementById('tnum').textContent = animals.length;
    document.getElementById('odnum').textContent = vaccinations.filter(v => v.status === 'overdue').length;
    document.getElementById('dtnum').textContent = vaccinations.filter(v => v.status === 'due_today').length;

    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);
    const upcoming = vaccinations.filter(v => {
        if (v.status !== 'upcoming') return false;
        const d = new Date(v.scheduledDate);
        return d <= in7Days;
    });
    document.getElementById('upnum').textContent = upcoming.length;

    const alertList = document.getElementById('alert-list');
    const noAlertMsg = document.getElementById('no-alert-msg');
    const urgent = vaccinations.filter(v => v.status === 'overdue' || v.status === 'due_today');

    if (urgent.length > 0) {
        noAlertMsg.style.display = 'none';
        alertList.innerHTML = '';
        urgent.forEach(v => {
            const div = document.createElement('div');
            div.style.cssText = 'background:#fff3cd;border-left:4px solid #e67e22;border-radius:8px;padding:12px;margin-bottom:8px;font-size:13px;';
            const scheduledDate = new Date(v.scheduledDate);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            const diffDays = Math.round((todayDate - scheduledDate) / 86400000);
            const label = v.status === 'overdue'
                ? `⚠️ Overdue by ${diffDays} day(s)`
                : '🔔 Due Today';
            div.innerHTML = `<strong>${v.animalName}</strong> — ${v.vaccineName} &nbsp;<span style="color:#e67e22;">(${label})</span>`;
            alertList.appendChild(div);
        });
    } else {
        noAlertMsg.style.display = 'block';
        alertList.innerHTML = '';
    }

    const tbody = document.getElementById('recent-tbody');
    const fallback = document.getElementById('recent_fall');
    const recent = [...vaccinations].reverse().slice(0, 5);

    if (recent.length > 0) {
        fallback.style.display = 'none';
        tbody.innerHTML = '';
        recent.forEach(v => {
            const tr = document.createElement('tr');
            const statusLabel = v.status.replace('_', ' ');
            tr.innerHTML = `
                <td>${v.animalName}</td>
                <td>${v.vaccineName}</td>
                <td>${v.scheduledDate}</td>
                <td><span class="badge badge-${v.status}">${statusLabel}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        fallback.style.display = 'block';
        tbody.innerHTML = '';
    }
}

function loadAnimals() {
    if (!document.getElementById('animal-form')) return;

    renderAnimalsTable();

    document.getElementById('animal-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const species = document.getElementById('species').value;
        const breed = document.getElementById('breed').value.trim();
        const genderEl = document.querySelector('input[name="gender"]:checked');
        const notes = document.getElementById('notes').value.trim();

        if (!name || !species || !breed || !genderEl) {
            alert('Please fill in all required fields including gender.');
            return;
        }

        const animals = getAnimals();
        const newAnimal = {
            id: generateAnimalId(),
            name: name,
            species: species,
            breed: breed,
            gender: genderEl.value,
            notes: notes,
            registeredOn: new Date().toLocaleDateString()
        };

        animals.push(newAnimal);
        saveAnimals(animals);
        this.reset();
        renderAnimalsTable();
        alert(`✅ "${name}" registered! ID: ${newAnimal.id}`);
    });

    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderAnimalsTable(this.value.toLowerCase());
        });
    }
}

function renderAnimalsTable(filter = '') {
    const animals = getAnimals();
    const tbody = document.getElementById('animals-tbody');
    const noMsg = document.getElementById('no-animals-regst');

    const filtered = animals.filter(a =>
        a.name.toLowerCase().includes(filter) ||
        a.id.toLowerCase().includes(filter) ||
        a.species.toLowerCase().includes(filter)
    );

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        noMsg.style.display = 'block';
        return;
    }

    noMsg.style.display = 'none';
    tbody.innerHTML = '';

    filtered.forEach(animal => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${animal.name}</td>
            <td>${capitalize(animal.species)}</td>
            <td>${animal.breed}</td>
            <td>${capitalize(animal.gender)}</td>
            <td>
                <button class="btn-done" onclick="goToVaccination('${animal.id}')">Add Vaccine</button>
                <button class="btn-delete" onclick="deleteAnimal('${animal.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteAnimal(id) {
    if (!confirm('Delete this animal? All its vaccinations will also be deleted.')) return;
    let animals = getAnimals();
    animals = animals.filter(a => a.id !== id);
    saveAnimals(animals);
    let vaccinations = getVaccinations();
    vaccinations = vaccinations.filter(v => v.animalId !== id);
    saveVaccinations(vaccinations);
    renderAnimalsTable();
}

function goToVaccination(animalId) {
    window.location.href = `vaccination.html?animal=${animalId}`;
}

function loadVaccination() {
    if (!document.getElementById('vacc-form')) return;

    updateAllStatuses();
    populateAnimalDropdown();
    renderVaccCards('all');

    const urlParams = new URLSearchParams(window.location.search);
    const preselected = urlParams.get('animal');
    if (preselected) {
        const select = document.getElementById('vacc-animal');
        select.value = preselected;
        updateVaccineDropdown(preselected);
    }

    document.getElementById('vacc-animal').addEventListener('change', function () {
        updateVaccineDropdown(this.value);
    });

    document.getElementById('vacc-name').addEventListener('change', function () {
        const customInput = document.getElementById('custom-vacc');
        if (this.value === 'other') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
            customInput.value = '';
        }
    });

    document.getElementById('vacc-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const animalId = document.getElementById('vacc-animal').value;
        const vaccSelect = document.getElementById('vacc-name');
        const customVacc = document.getElementById('custom-vacc').value.trim();
        const scheduledDate = document.getElementById('vacc-date').value;
        const notes = document.getElementById('vacc-notes').value.trim();

        if (!animalId) { alert('Please select an animal.'); return; }
        if (!scheduledDate) { alert('Please select a scheduled date.'); return; }

        let vaccineName = '';
        if (vaccSelect.value === 'other') {
            if (!customVacc) { alert('Please enter a custom vaccine name.'); return; }
            vaccineName = customVacc;
        } else {
            vaccineName = vaccSelect.options[vaccSelect.selectedIndex].text;
        }

        const animals = getAnimals();
        const animal = animals.find(a => a.id === animalId);

        const vaccinations = getVaccinations();
        const newVacc = {
            id: generateVaccId(),
            animalId: animalId,
            animalName: animal.name,
            animalSpecies: animal.species,
            vaccineName: vaccineName,
            scheduledDate: scheduledDate,
            status: calculateStatus(scheduledDate),
            completedDate: null,
            nextDueDate: null,
            notes: notes
        };

        vaccinations.push(newVacc);
        saveVaccinations(vaccinations);
        this.reset();
        document.getElementById('custom-vacc').style.display = 'none';
        renderVaccCards('all');
        resetFilterButtons();
        alert(`✅ Vaccination scheduled for "${animal.name}"!`);
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-filter'));
            this.classList.add('active-filter');
            renderVaccCards(this.dataset.filter);
        });
    });

    document.getElementById('vacc-search').addEventListener('input', function () {
        const activeFilter = document.querySelector('.filter-btn.active-filter').dataset.filter;
        renderVaccCards(activeFilter, this.value.toLowerCase());
    });
}

function populateAnimalDropdown() {
    const animals = getAnimals();
    const select = document.getElementById('vacc-animal');
    select.innerHTML = '<option value="" selected>-- Select Animal --</option>';
    animals.forEach(a => {
        const option = document.createElement('option');
        option.value = a.id;
        option.textContent = `${a.name} (${capitalize(a.species)})`;
        select.appendChild(option);
    });
}

function updateVaccineDropdown(animalId) {
    const animals = getAnimals();
    const animal = animals.find(a => a.id === animalId);
    const vaccSelect = document.getElementById('vacc-name');

    if (!animal) {
        vaccSelect.innerHTML = '<option value="">-- Select Animal First --</option>';
        return;
    }

    const vaccines = vaccineMap[animal.species] || [];
    vaccSelect.innerHTML = '';

    vaccines.forEach(v => {
        const option = document.createElement('option');
        option.value = v.toLowerCase().replace(/ /g, '-');
        option.textContent = v;
        vaccSelect.appendChild(option);
    });

    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'Other (Custom)';
    vaccSelect.appendChild(otherOption);
}

function renderVaccCards(filter = 'all', search = '') {
    updateAllStatuses();
    const vaccinations = getVaccinations();
    const container = document.getElementById('vacc-list');
    const noMsg = document.getElementById('no-vacc-msg');

    let filtered = vaccinations.filter(v => {
        const matchFilter = filter === 'all' || v.status === filter;
        const matchSearch = v.animalName.toLowerCase().includes(search) ||
                            v.vaccineName.toLowerCase().includes(search);
        return matchFilter && matchSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '';
        noMsg.style.display = 'block';
        return;
    }

    noMsg.style.display = 'none';
    container.innerHTML = '';

    filtered.forEach(v => {
        const card = document.createElement('div');
        card.className = `vacc-card status-${v.status}`;
        const statusLabel = v.status.replace('_', ' ');
        const showDoneBtn = v.status !== 'completed'
            ? `<button class="btn-done" onclick="markDone('${v.id}')">✅ Mark as Done</button>`
            : '';

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <h3>${v.animalName} <small style="font-size:12px;color:#6b6b6b;">(${v.id})</small></h3>
                <span class="badge badge-${v.status}">${statusLabel}</span>
            </div>
            <p>💉 ${v.vaccineName}</p>
            <p>📅 Scheduled: ${v.scheduledDate}</p>
            ${v.completedDate ? `<p>✅ Completed: ${v.completedDate}</p>` : ''}
            ${v.nextDueDate ? `<p>🔜 Next Due: ${v.nextDueDate}</p>` : ''}
            ${v.notes ? `<p>📝 ${v.notes}</p>` : ''}
            <div class="card-actions">
                ${showDoneBtn}
                <button class="btn-delete" onclick="deleteVacc('${v.id}')">🗑 Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function markDone(vaccId) {
    const completedDate = prompt('Completed date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!completedDate) return;
    const nextDueDate = prompt('Next due date (YYYY-MM-DD) — leave blank if none:', '');

    let vaccinations = getVaccinations();
    const index = vaccinations.findIndex(v => v.id === vaccId);
    if (index === -1) return;

    vaccinations[index].status = 'completed';
    vaccinations[index].completedDate = completedDate;
    vaccinations[index].nextDueDate = nextDueDate || null;

    if (nextDueDate) {
        const v = vaccinations[index];
        const newVacc = {
            id: generateVaccId(),
            animalId: v.animalId,
            animalName: v.animalName,
            animalSpecies: v.animalSpecies,
            vaccineName: v.vaccineName,
            scheduledDate: nextDueDate,
            status: calculateStatus(nextDueDate),
            completedDate: null,
            nextDueDate: null,
            notes: 'Follow-up vaccination'
        };
        vaccinations.push(newVacc);
    }

    saveVaccinations(vaccinations);
    const activeFilter = document.querySelector('.filter-btn.active-filter').dataset.filter;
    renderVaccCards(activeFilter);
    alert('✅ Marked as completed!');
}

function deleteVacc(vaccId) {
    if (!confirm('Delete this vaccination record?')) return;
    let vaccinations = getVaccinations();
    vaccinations = vaccinations.filter(v => v.id !== vaccId);
    saveVaccinations(vaccinations);
    const activeFilter = document.querySelector('.filter-btn.active-filter').dataset.filter;
    renderVaccCards(activeFilter);
}

function resetFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-filter'));
    document.querySelector('[data-filter="all"]').classList.add('active-filter');
}

function loadHistory() {
    if (!document.getElementById('history-tbody')) return;

    updateAllStatuses();
    populateHistoryAnimalFilter();
    renderHistoryTable();

    document.getElementById('filter-animal').addEventListener('change', function () {
        renderHistoryTable(this.value, document.getElementById('history-search').value.toLowerCase());
    });

    document.getElementById('history-search').addEventListener('input', function () {
        renderHistoryTable(document.getElementById('filter-animal').value, this.value.toLowerCase());
    });
}

function populateHistoryAnimalFilter() {
    const animals = getAnimals();
    const select = document.getElementById('filter-animal');
    select.innerHTML = '<option value="all">All Animals</option>';
    animals.forEach(a => {
        const option = document.createElement('option');
        option.value = a.id;
        option.textContent = `${a.name} (${a.id})`;
        select.appendChild(option);
    });
}

function renderHistoryTable(animalFilter = 'all', search = '') {
    const vaccinations = getVaccinations();
    const tbody = document.getElementById('history-tbody');
    const noMsg = document.getElementById('no-history-msg');

    let completed = vaccinations.filter(v => v.status === 'completed');

    if (animalFilter !== 'all') {
        completed = completed.filter(v => v.animalId === animalFilter);
    }

    if (search) {
        completed = completed.filter(v =>
            v.animalName.toLowerCase().includes(search) ||
            v.vaccineName.toLowerCase().includes(search)
        );
    }

    const allCompleted = vaccinations.filter(v => v.status === 'completed');
    const uniqueAnimals = [...new Set(allCompleted.map(v => v.animalId))];
    document.getElementById('total-records').textContent = allCompleted.length;
    document.getElementById('animals-tracked').textContent = uniqueAnimals.length;

    if (completed.length === 0) {
        tbody.innerHTML = '';
        noMsg.style.display = 'block';
        return;
    }

    noMsg.style.display = 'none';
    tbody.innerHTML = '';

    completed.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));

    completed.forEach((v, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${v.animalName}</td>
            <td>${capitalize(v.animalSpecies || '')}</td>
            <td>${v.vaccineName}</td>
            <td>${v.scheduledDate}</td>
            <td>${v.completedDate || '—'}</td>
            <td>${v.nextDueDate || '—'}</td>
            <td>${v.notes || '—'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

document.addEventListener('DOMContentLoaded', function () {
    loadDashboard();
    loadAnimals();
    loadVaccination();
    loadHistory();
});