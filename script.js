let currentPhoto = null;
let editTargetCard = null;

// Load data when page opens
window.onload = function() {
    loadEmployees();
};

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
    const errorText = document.getElementById('phoneError');
    errorText.style.display = (input.value.length > 0 && input.value.length !== 10) ? 'block' : 'none';
}

document.getElementById('imageUpload').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        currentPhoto = reader.result;
        document.getElementById('imagePreview').innerHTML = `<img src="${currentPhoto}" style="width:100%; height:100%; object-fit:cover;">`;
    };
    if(e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
});

function applyFilters() {
    const nameQuery = document.getElementById('searchInput').value.toUpperCase();
    const deptFilter = document.getElementById('deptFilter').value;
    const cards = document.querySelectorAll('.employee-card');
    let count = 0;

    cards.forEach(card => {
        const matchesName = card.dataset.name.includes(nameQuery);
        const matchesDept = (deptFilter === 'all' || card.dataset.dept === deptFilter);
        
        if (matchesName && matchesDept) {
            card.style.display = 'flex';
            count++;
        } else {
            card.style.display = 'none';
        }
    });
    document.getElementById('noMatchMessage').style.display = (count === 0) ? 'block' : 'none';
}

function addEmployee() {
    const name = document.getElementById('empName').value.toUpperCase();
    const email = document.getElementById('empEmail').value;
    const phone = document.getElementById('empNumber').value;
    const dept = document.getElementById('empDept').value;

    if (!name || !email || phone.length !== 10 || !dept || !currentPhoto) {
        alert("Please complete all fields correctly.");
        return;
    }

    if (editTargetCard) {
        updateCard(editTargetCard, name, email, phone, dept, currentPhoto);
    } else {
        const card = document.createElement('div');
        card.className = 'employee-card';
        updateCard(card, name, email, phone, dept, currentPhoto);
        document.getElementById('employee-list').appendChild(card);
    }

    saveEmployees();
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
    editTargetCard = null;
}

function deleteEmployee(card) {
    card.remove();
    saveEmployees();
    applyFilters();
}

function clearAllEmployees() {
    if (confirm("Delete ALL employees permanently?")) {
        document.getElementById('employee-list').innerHTML = '';
        localStorage.removeItem('muthamilEmployees');
        applyFilters();
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

function saveEmployees() {
    const cards = document.querySelectorAll('.employee-card');
    const data = Array.from(cards).map(card => ({
        name: card.dataset.name,
        email: card.dataset.email,
        phone: card.dataset.phone,
        dept: card.dataset.dept,
        photo: card.dataset.photo
    }));
    localStorage.setItem('muthamilEmployees', JSON.stringify(data));
}

function loadEmployees() {
    const saved = localStorage.getItem('muthamilEmployees');
    if (saved) {
        JSON.parse(saved).forEach(emp => {
            const card = document.createElement('div');
            card.className = 'employee-card';
            updateCard(card, emp.name, emp.email, emp.phone, emp.dept, emp.photo);
            document.getElementById('employee-list').appendChild(card);
        });
    }
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