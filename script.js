// This link connects your website to your Firebase cloud database
const DB_URL = "https://muthamil-hr-default-rtdb.firebaseio.com/employees.json";

let currentPhoto = null;
let editTargetCard = null;

// Automatically load data from the cloud when the page opens
window.onload = loadEmployees;

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

function openRegistration() { 
    resetForm(); 
    showView('form-view'); 
}

function validatePhone(input) {
    input.value = input.value.replace(/\D/g, '');
    document.getElementById('phoneError').style.display = (input.value.length > 0 && input.value.length !== 10) ? 'block' : 'none';
}

document.getElementById('imageUpload').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        currentPhoto = reader.result;
        document.getElementById('imagePreview').innerHTML = `<img src="${currentPhoto}" style="width:100%; height:100%; object-fit:cover;">`;
    };
    if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
});

async function addEmployee() {
    const name = document.getElementById('empName').value.toUpperCase();
    const email = document.getElementById('empEmail').value;
    const phone = document.getElementById('empNumber').value;
    const dept = document.getElementById('empDept').value;

    if (!name || !email || phone.length !== 10 || !dept || !currentPhoto) {
        alert("Please fill all details correctly (10-digit phone and photo required)");
        return;
    }

    if (editTargetCard) editTargetCard.remove(); 
    
    const card = document.createElement('div');
    card.className = 'employee-card';
    updateCard(card, name, email, phone, dept, currentPhoto);
    document.getElementById('employee-list').appendChild(card);

    await saveEmployees(); // Save to Firebase
    resetForm();
    showView('dashboard-view');
}

function updateCard(card, name, email, phone, dept, photo) {
    card.dataset.name = name;
    card.dataset.dept = dept;
    card.dataset.email = email;
    card.dataset.phone = phone;
    card.dataset.photo = photo;

    card.innerHTML = `
        <img src="${photo}" class="card-img">
        <div style="flex:1">
            <h3>${name}</h3>
            <p><strong>Dept:</strong> ${dept}</p>
            <p>${email} | ${phone}</p>
        </div>
        <div>
            <button class="edit-btn" onclick="prepareEdit(this.parentElement.parentElement)">Edit</button>
            <button class="del-btn" onclick="deleteEmployee(this.parentElement.parentElement)">Delete</button>
        </div>`;
}

// Uploads the current list to the Firebase cloud
async function saveEmployees() {
    const cards = document.querySelectorAll('.employee-card');
    const data = Array.from(cards).map(card => ({
        name: card.dataset.name,
        email: card.dataset.email,
        phone: card.dataset.phone,
        dept: card.dataset.dept,
        photo: card.dataset.photo
    }));
    await fetch(DB_URL, { method: 'PUT', body: JSON.stringify(data) });
}

// Fetches data from Firebase so it appears on any device
async function loadEmployees() {
    try {
        const response = await fetch(DB_URL);
        const data = await response.json();
        const list = document.getElementById('employee-list');
        list.innerHTML = '';
        if (data) {
            data.forEach(emp => {
                const card = document.createElement('div');
                card.className = 'employee-card';
                updateCard(card, emp.name, emp.email, emp.phone, emp.dept, emp.photo);
                list.appendChild(card);
            });
        }
        applyFilters();
    } catch (e) { console.error("Database connection failed", e); }
}

async function deleteEmployee(card) {
    card.remove();
    await saveEmployees();
    applyFilters();
}

async function clearAllEmployees() {
    if (confirm("Permanently delete ALL employee records from the database?")) {
        await fetch(DB_URL, { method: 'DELETE' });
        loadEmployees();
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

function applyFilters() {
    const nameQuery = document.getElementById('searchInput').value.toUpperCase();
    const deptFilter = document.getElementById('deptFilter').value;
    const cards = document.querySelectorAll('.employee-card');
    let count = 0;
    cards.forEach(card => {
        const matchesName = card.dataset.name.includes(nameQuery);
        const matchesDept = (deptFilter === 'all' || card.dataset.dept === deptFilter);
        card.style.display = (matchesName && matchesDept) ? 'flex' : 'none';
        if (matchesName && matchesDept) count++;
    });
    document.getElementById('noMatchMessage').style.display = (count === 0) ? 'block' : 'none';
}

function resetForm() {
    document.getElementById('empName').value = '';
    document.getElementById('empEmail').value = '';
    document.getElementById('empNumber').value = '';
    document.getElementById('empDept').value = '';
    document.getElementById('imagePreview').innerHTML = '<span>UPLOAD IMAGE</span>';
    document.getElementById('formTitle').innerText = "Registration";
    currentPhoto = null; 
    editTargetCard = null;
}

function cancelForm() { resetForm(); showView('dashboard-view'); }