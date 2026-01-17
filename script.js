const DB_URL = "https://muthamil-hr-default-rtdb.firebaseio.com/employees.json";
const ADMIN_PASS = "Admin@123";

let currentPhoto = null;
let editTargetCard = null;

window.onload = loadEmployees;

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(viewId);
    if(target) target.classList.remove('hidden');
}

function openRegistration() { 
    resetForm(); 
    document.getElementById('formTitle').innerText = "Registration";
    showView('form-view'); 
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
    const name = document.getElementById('empName').value.toUpperCase().trim();
    const email = document.getElementById('empEmail').value.trim();
    const phone = document.getElementById('empNumber').value.trim();
    const dept = document.getElementById('empDept').value;

    if (!name || !email || !phone || !dept || !currentPhoto) {
        alert("Fill all the details");
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        alert("Mobile number must be exactly 10 digits");
        return;
    }

    // Move logic BEFORE the cloud save to make it feel instant
    if (editTargetCard) editTargetCard.remove(); 
    
    const card = document.createElement('div');
    card.className = 'employee-card';
    updateCard(card, name, email, phone, dept, currentPhoto);
    document.getElementById('employee-list').appendChild(card);

    // Save in background
    saveEmployees(); 
    
    // Immediate Feedback and Exit
    alert("Employee details saved. Go back to team directory page.");
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
        <div class="card-info" style="flex:1">
            <h3>${name}</h3>
            <p><strong>DEPT:</strong> ${dept}</p>
            <p><strong>EMAIL:</strong> ${email}</p>
            <p><strong>CALL:</strong> ${phone}</p>
        </div>
        <div class="card-actions">
            <button class="edit-btn" onclick="prepareEdit(this.closest('.employee-card'))">EDIT</button>
            <button class="del-btn" onclick="deleteEmployee(this.closest('.employee-card'))">DELETE</button>
        </div>`;
}

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
    } catch (e) { console.error(e); }
}

async function deleteEmployee(card) {
    const p = prompt("Enter Admin Password to Delete:");
    if (p === ADMIN_PASS) {
        card.remove();
        await saveEmployees();
    } else if (p !== null) {
        alert("Incorrect Password!");
    }
}

async function clearAllEmployees() {
    const p = prompt("Enter Admin Password to Clear All:");
    if (p === ADMIN_PASS) {
        if(confirm("Wipe all data?")) {
            await fetch(DB_URL, { method: 'DELETE' });
            document.getElementById('employee-list').innerHTML = '';
        }
    } else if (p !== null) { alert("Wrong Password!"); }
}

function prepareEdit(card) {
    editTargetCard = card;
    document.getElementById('empName').value = card.dataset.name;
    document.getElementById('empEmail').value = card.dataset.email;
    document.getElementById('empNumber').value = card.dataset.phone;
    document.getElementById('empDept').value = card.dataset.dept;
    currentPhoto = card.dataset.photo;
    document.getElementById('imagePreview').innerHTML = `<img src="${currentPhoto}" style="width:100%; height:100%; object-fit:cover;">`;
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

function applyFilters() {
    const nameQ = document.getElementById('searchInput').value.toUpperCase();
    const deptQ = document.getElementById('deptFilter').value;
    const cards = document.querySelectorAll('.employee-card');
    let count = 0;
    cards.forEach(card => {
        const match = card.dataset.name.includes(nameQ) && (deptQ === 'all' || card.dataset.dept === deptQ);
        card.style.display = match ? 'flex' : 'none';
        if (match) count++;
    });
    document.getElementById('noMatchMessage').style.display = (count === 0 && cards.length > 0) ? 'block' : 'none';
}