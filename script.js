const DB_URL = "https://muthamil-hr-default-rtdb.firebaseio.com/employees.json";
const ADMIN_PASS = "muthamil";

let currentPhoto = null;
let editTargetCard = null;

window.onload = () => {
    const cachedData = localStorage.getItem('hr_cache');
    if (cachedData) renderCards(JSON.parse(cachedData));
    loadEmployees();
};

/**
 * TOAST WARNING WITH SOUND
 */
function showWarning(message) {
    // Play sound
    const sound = document.getElementById('warning-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Sound blocked by browser"));
    }

    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerText = message;
    container.innerHTML = ''; 
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');
    if (viewId === 'dashboard-view') loadEmployees();
}

function openRegistration() { 
    resetForm(); 
    document.getElementById('formTitle').innerText = "Registration";
    showView('form-view'); 
}

/**
 * SAVING PROCESS (INSTANT + BACKGROUND)
 */
async function addEmployee() {
    const name = document.getElementById('empName').value.toUpperCase().trim();
    const email = document.getElementById('empEmail').value.trim();
    const phone = document.getElementById('empNumber').value.trim();
    const dept = document.getElementById('empDept').value;

    if (!name || !email || !phone || !dept || !currentPhoto) {
        showWarning("FILL ALL DETAILS AND PHOTO");
        return;
    }

    let list = JSON.parse(localStorage.getItem('hr_cache') || "[]");
    if (editTargetCard) {
        list = list.filter(emp => emp.email !== editTargetCard.dataset.email);
    }
    list.push({ name, email, phone, dept, photo: currentPhoto });

    // Local Update & UI Change (Instant)
    localStorage.setItem('hr_cache', JSON.stringify(list));
    renderCards(list);
    resetForm();
    showView('dashboard-view');

    // Cloud Sync (Background keepalive fixes 'Network Error')
    fetch(DB_URL, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list),
        keepalive: true 
    });
}

async function loadEmployees() {
    try {
        const response = await fetch(`${DB_URL}?t=${new Date().getTime()}`);
        const data = await response.json();
        if (data) {
            const empArray = Array.isArray(data) ? data : Object.values(data);
            localStorage.setItem('hr_cache', JSON.stringify(empArray));
            renderCards(empArray);
        }
    } catch (e) { console.log("Cache mode"); }
}

function renderCards(empArray) {
    const list = document.getElementById('employee-list');
    if (!list) return;
    list.innerHTML = ''; 
    empArray.forEach(emp => {
        if (emp && emp.name) {
            const card = document.createElement('div');
            card.className = 'employee-card';
            card.dataset.name = emp.name; card.dataset.email = emp.email;
            card.dataset.phone = emp.phone; card.dataset.dept = emp.dept;
            card.dataset.photo = emp.photo;
            card.innerHTML = `
                <img src="${emp.photo}" class="card-img">
                <div class="card-info" style="flex:1">
                    <h3>${emp.name}</h3>
                    <p><strong>DEPT:</strong> ${emp.dept}</p>
                    <p><strong>EMAIL:</strong> ${emp.email}</p>
                    <p><strong>CALL:</strong> ${emp.phone}</p>
                </div>
                <div class="card-actions">
                    <button class="edit-btn" onclick="prepareEdit(this.closest('.employee-card'))">EDIT</button>
                    <button class="del-btn" onclick="deleteEmployee(this.closest('.employee-card'))">DELETE</button>
                </div>`;
            list.appendChild(card);
        }
    });
}

/**
 * PASSWORD PROTECTION
 */
async function deleteEmployee(card) {
    const pass = prompt("Enter Admin Password:");
    if (pass === ADMIN_PASS) {
        card.remove();
        const list = Array.from(document.querySelectorAll('.employee-card')).map(c => ({
            name: c.dataset.name, email: c.dataset.email, phone: c.dataset.phone, dept: c.dataset.dept, photo: c.dataset.photo
        }));
        localStorage.setItem('hr_cache', JSON.stringify(list));
        fetch(DB_URL, { method: 'PUT', body: JSON.stringify(list), keepalive: true });
    } else if (pass !== null) {
        showWarning("PASSWORD IS WRONG");
    }
}

async function clearAllEmployees() {
    const pass = prompt("Enter Admin Password:");
    if (pass === ADMIN_PASS) {
        if (confirm("Clear all data?")) {
            localStorage.removeItem('hr_cache');
            await fetch(DB_URL, { method: 'DELETE' });
            location.reload();
        }
    } else if (pass !== null) {
        showWarning("PASSWORD IS WRONG");
    }
}

function prepareEdit(card) {
    editTargetCard = card;
    document.getElementById('empName').value = card.dataset.name;
    document.getElementById('empEmail').value = card.dataset.email;
    document.getElementById('empNumber').value = card.dataset.phone;
    document.getElementById('empDept').value = card.dataset.dept;
    currentPhoto = card.dataset.photo;
    document.getElementById('imagePreview').innerHTML = `<img src="${currentPhoto}" style="width:100%; height:100%; object-fit:cover;">`;
    document.getElementById('formTitle').innerText = "Edit Details";
    showView('form-view');
}

function resetForm() {
    document.getElementById('empName').value = ''; 
    document.getElementById('empEmail').value = '';
    document.getElementById('empNumber').value = ''; 
    document.getElementById('empDept').value = '';
    document.getElementById('imagePreview').innerHTML = '<span>UPLOAD</span>';
    currentPhoto = null; editTargetCard = null;
}

function cancelForm() { resetForm(); showView('dashboard-view'); }

document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            currentPhoto = reader.result;
            document.getElementById('imagePreview').innerHTML = `<img src="${currentPhoto}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
    }
});

function applyFilters() {
    const nameQ = document.getElementById('searchInput').value.toUpperCase();
    const deptQ = document.getElementById('deptFilter').value;
    const cards = document.querySelectorAll('.employee-card');
    cards.forEach(card => {
        const match = card.dataset.name.includes(nameQ) && (deptQ === 'all' || card.dataset.dept === deptQ);
        card.style.display = match ? 'flex' : 'none';
    });
}