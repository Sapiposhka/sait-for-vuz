// Класс для абитуриента
class Applicant {
    constructor(id, fullName, birthDate, score, priorities, status, photo = null) {
        this.id = id;
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.score = score;
        this.priorities = priorities;
        this.status = status;
        this.photo = photo;
    }
}

// Класс для управления приложением
class CompetitionApp {
    constructor() {
        this.currentView = 'list';
        this.editingId = null;
        this.applicants = [];
        
        // Инициализация элементов DOM
        this.initDOMElements();
        // Настройка событий
        this.setupEvents();
        // Загрузка данных
        this.loadData();
        // Показать начальный вид
        this.showView('list');
    }
    
    initDOMElements() {
        // Кнопки навигации
        this.btnShowList = document.getElementById('btn-show-list');
        this.btnAddNew = document.getElementById('btn-add-new');
        
        
        // Виды
        this.listView = document.getElementById('list-view');
        this.formView = document.getElementById('form-view');
        this.statsView = document.getElementById('stats-view');
        
        // Элементы таблицы
        this.applicantsList = document.getElementById('applicants-list');
        
        // Форма
        this.applicantForm = document.getElementById('applicant-form');
        this.applicantIdInput = document.getElementById('applicant-id');
        this.fullNameInput = document.getElementById('full-name');
        this.birthDateInput = document.getElementById('birth-date');
        this.scoreInput = document.getElementById('score');
        this.prioritiesInput = document.getElementById('priorities');
        this.statusSelect = document.getElementById('status');
        this.photoInput = document.getElementById('photo');
        this.saveBtn = document.getElementById('save-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        
        // Поиск
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        
        // Статистика
        this.totalApplicantsEl = document.getElementById('total-applicants');
        this.avgScoreEl = document.getElementById('avg-score');
        this.acceptedCountEl = document.getElementById('accepted-count');
        this.waitingCountEl = document.getElementById('waiting-count');
        this.statsChart = document.getElementById('stats-chart');
    }
    
    setupEvents() {
        // Навигация
        this.btnShowList.addEventListener('click', () => this.showView('list'));
        this.btnAddNew.addEventListener('click', () => {
            this.editingId = null;
            this.showView('form');
            this.resetForm();
        });
        
        
        // Форма
        this.applicantForm.addEventListener('submit', (e) => this.saveApplicant(e));
        this.cancelBtn.addEventListener('click', () => this.showView('list'));
        
        // Поиск
        this.searchBtn.addEventListener('click', () => this.searchApplicants());
        this.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchApplicants();
        });
        
        // Валидация в реальном времени
        this.scoreInput.addEventListener('input', () => this.validateScore());
    }
    
    async loadData() {
        try {
            this.applicants = await window.db.getApplicants();
            this.renderApplicantsList(this.applicants);
            this.updateStats();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            alert('Не удалось загрузить данные');
        }
    }
    
    showView(viewName) {
        // Скрыть все виды
        this.listView.classList.add('hidden');
        this.formView.classList.add('hidden');
        this.statsView.classList.add('hidden');
        
        // Снять активность со всех кнопок
        this.btnShowList.classList.remove('active');
        this.btnAddNew.classList.remove('active');
        
        
        // Показать выбранный вид
        switch (viewName) {
            case 'list':
                this.listView.classList.remove('hidden');
                this.btnShowList.classList.add('active');
                this.currentView = 'list';
                break;
            case 'form':
                this.formView.classList.remove('hidden');
                this.btnAddNew.classList.add('active');
                this.currentView = 'form';
                this.fullNameInput.focus();
                break;
            
        }
    }
    
    renderApplicantsList(applicants) {
        this.applicantsList.innerHTML = '';
        
        if (applicants.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 7; // Увеличиваем colspan на 1 для колонки с фото
            cell.textContent = 'Нет данных для отображения';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            this.applicantsList.appendChild(row);
            return;
        }
        
        applicants.forEach(applicant => {
            const row = document.createElement('tr');
            
            // Колонка для фото
            const photoCell = document.createElement('td');
            if (applicant.photo) {
                const photoImg = document.createElement('img');
                // Если photo - это URL (строка)
                if (typeof applicant.photo === 'string') {
                    photoImg.src = applicant.photo;
                } 
                // Если photo - это Blob/File
                else if (applicant.photo instanceof Blob) {
                    photoImg.src = URL.createObjectURL(applicant.photo);
                }
                photoImg.alt = 'Фото абитуриента';
                photoImg.style.width = '70px';
                photoImg.style.height = '70px';
                photoImg.style.borderRadius = '50%';
                photoImg.style.objectFit = 'cover';
                photoCell.appendChild(photoImg);
            } else {
                photoCell.textContent = 'Нет фото';
                photoCell.style.textAlign = 'center';
            }
            row.appendChild(photoCell);
            
            // ФИО
            const nameCell = document.createElement('td');
            nameCell.textContent = applicant.fullName;
            row.appendChild(nameCell);
            
            // Дата рождения
            const birthCell = document.createElement('td');
            birthCell.textContent = new Date(applicant.birthDate).toLocaleDateString();
            row.appendChild(birthCell);
            
            // Баллы
            const scoreCell = document.createElement('td');
            scoreCell.textContent = applicant.score;
            row.appendChild(scoreCell);
            
            // Приоритеты
            const prioritiesCell = document.createElement('td');
            prioritiesCell.textContent = applicant.priorities;
            row.appendChild(prioritiesCell);
            
            // Статус
            const statusCell = document.createElement('td');
            statusCell.textContent = this.getStatusText(applicant.status);
            row.appendChild(statusCell);
            
            // Действия
            const actionsCell = document.createElement('td');
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Изменить';
            editBtn.className = 'action-button edit-btn';
            editBtn.addEventListener('click', () => this.editApplicant(applicant.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.className = 'action-button delete-btn';
            deleteBtn.addEventListener('click', () => this.deleteApplicant(applicant.id));
            
            actionsCell.appendChild(editBtn);
            actionsCell.appendChild(deleteBtn);
            row.appendChild(actionsCell);
            
            this.applicantsList.appendChild(row);
        });
    }
    
    getStatusText(status) {
        const statuses = {
            'pending': 'На рассмотрении',
            'accepted': 'Зачислен',
            'rejected': 'Отклонен',
            'waiting': 'В резерве'
        };
        return statuses[status] || status;
    }
    
    resetForm() {
        this.applicantIdInput.value = '';
        this.fullNameInput.value = '';
        this.birthDateInput.value = '';
        this.scoreInput.value = '';
        this.prioritiesInput.value = '';
        this.statusSelect.value = 'pending';
        this.photoInput.value = '';
        this.saveBtn.textContent = 'Добавить';
    }
    
    editApplicant(id) {
        const applicant = this.applicants.find(a => a.id === id);
        if (!applicant) {
            alert('Абитуриент не найден');
            return;
        }
        
        this.editingId = id;
        this.showView('form');
        
        // Заполнить форму данными
        this.applicantIdInput.value = applicant.id;
        this.fullNameInput.value = applicant.fullName;
        this.birthDateInput.value = applicant.birthDate;
        this.scoreInput.value = applicant.score;
        this.prioritiesInput.value = applicant.priorities;
        this.statusSelect.value = applicant.status;
        this.saveBtn.textContent = 'Обновить';
    }
    
    async saveApplicant(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        const formData = {
            fullName: this.fullNameInput.value.trim(),
            birthDate: this.birthDateInput.value,
            score: parseInt(this.scoreInput.value),
            priorities: this.prioritiesInput.value.trim(),
            status: this.statusSelect.value,
            photo: this.photoInput.files[0] || null
        };
        
        try {
            if (this.editingId) {
                await window.db.updateApplicant(this.editingId, formData);
                alert('Данные абитуриента успешно обновлены');
            } else {
                await window.db.addApplicant(formData);
                alert('Абитуриент успешно добавлен');
            }
            
            // Обновить список и показать его
            this.applicants = await window.db.getApplicants();
            this.renderApplicantsList(this.applicants);
            this.showView('list');
            this.updateStats();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить данные');
        }
    }
    
    validateForm() {
        // Проверка ФИО
        if (this.fullNameInput.value.trim().length < 3) {
            alert('ФИО должно содержать не менее 3 символов');
            this.fullNameInput.focus();
            return false;
        }
        
        // Проверка даты рождения
        if (!this.birthDateInput.value) {
            alert('Укажите дату рождения');
            this.birthDateInput.focus();
            return false;
        }
        
        // Проверка баллов
        if (!this.validateScore()) {
            return false;
        }
        
        // Проверка приоритетов
        if (this.prioritiesInput.value.trim().length === 0) {
            alert('Укажите хотя бы один приоритет');
            this.prioritiesInput.focus();
            return false;
        }
        
        return true;
    }
    
    validateScore() {
        const score = parseInt(this.scoreInput.value);
        if (isNaN(score) || score < 0 || score > 400) {
            alert('Баллы должны быть числом от 0 до 400');
            this.scoreInput.focus();
            return false;
        }
        return true;
    }
    
    async deleteApplicant(id) {
        if (!confirm('Вы уверены, что хотите удалить этого абитуриента?')) {
            return;
        }
        
        try {
            await window.db.deleteApplicant(id);
            this.applicants = await window.db.getApplicants();
            this.renderApplicantsList(this.applicants);
            this.updateStats();
            alert('Абитуриент удален');
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('Не удалось удалить абитуриента');
        }
    }
    
    searchApplicants() {
        const searchTerm = this.searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length === 0) {
            this.renderApplicantsList(this.applicants);
            return;
        }
        
        const filtered = this.applicants.filter(applicant => {
            return applicant.fullName.toLowerCase().includes(searchTerm) || 
                   applicant.score.toString().includes(searchTerm);
        });
        
        this.renderApplicantsList(filtered);
    }
    
    updateStats() {
        if (this.applicants.length === 0) {
            this.totalApplicantsEl.textContent = '0';
            this.avgScoreEl.textContent = '0';
            this.acceptedCountEl.textContent = '0';
            this.waitingCountEl.textContent = '0';
            return;
        }
        
        // Общее количество
        this.totalApplicantsEl.textContent = this.applicants.length;
        
        // Средний балл
        const avgScore = this.applicants.reduce((sum, a) => sum + a.score, 0) / this.applicants.length;
        this.avgScoreEl.textContent = avgScore.toFixed(1);
        
        // Количество зачисленных
        const acceptedCount = this.applicants.filter(a => a.status === 'accepted').length;
        this.acceptedCountEl.textContent = acceptedCount;
        
        // Количество в резерве
        const waitingCount = this.applicants.filter(a => a.status === 'waiting').length;
        this.waitingCountEl.textContent = waitingCount;
        
        // Обновить график
        this.updateChart();
    }
    
    updateChart() {
        console.log('Chart would be updated here with actual data');
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new CompetitionApp();
});