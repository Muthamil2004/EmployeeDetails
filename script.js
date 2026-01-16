let currentPhoto = null;
let editTargetCard = null;

// View switcher
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
}

function openRegistration() {
    resetForm();
    showView('form-view');
}

// Mobile-friendly phone validation
function validatePhone(input) {
    input.value = input.value.replace(/\D/g, '');
    const errorText = document.getElementById('phoneError');
    errorText.style.display = (input.value.length > 0 && input.value.length !== 10) ? 'block' : 'none';
}

// Image preview handler
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        currentPhoto = reader.result;
        document.getElementById('imagePreview').innerHTML = `<img src="${currentPhoto}" style="width:100%; height:100%; object-fit:cover;">`;
    };
    reader.readAsDataURL(e.target.files[0]);
});

// Search and Department filtering
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

// Add or Update Employee
function addEmployee() {
    const name = document.getElementById('empName').value.toUpperCase();
    const email = document.getElementById('empEmail').value;
    const phone = document.getElementById('empNumber').value;
    const dept = document.getElementById('empDept').value;

    if (!name || !email || phone.length !== 10 || !dept || !currentPhoto) {
        alert("Please complete all fields (10-digit phone and photo required)");
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
            <h3 style="color:#1e293b">${name}</h3>
            <p><strong>Dept:</strong> ${dept}</p>
            <p>${email} | ${phone}</p>
        </div>
        <div>
            <button class="edit-btn" onclick="prepareEdit(this.parentElement.parentElement)">Edit</button>
            <button class="del-btn" onclick="this.parentElement.parentElement.remove(); applyFilters();">Delete</button>
        </div>`;
    editTargetCard = null;
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
    document.getElementById('imagePreview').innerHTML = '<span>UPLOAD IMAGE</span>';
    document.getElementById('formTitle').innerText = "Registration";
    currentPhoto = null;
    editTargetCard = null;
}

function cancelForm() { resetForm(); showView('dashboard-view'); }