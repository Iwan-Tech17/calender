
const calendarGrid = document.getElementById('calendar-grid');
const monthYearDisplay = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const todayBtn = document.getElementById('today-btn');
const modal = document.getElementById('event-modal');
const cancelBtn = document.getElementById('cancel-btn');
const eventForm = document.getElementById('event-form');
const selectedDateSpan = document.getElementById('selected-date');

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
let selectedDateString = null;

function renderCalendar() {
    calendarGrid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearDisplay.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const dayDiv = createDayCell(daysInPrevMonth - i, 'other-month', new Date(year, month - 1, daysInPrevMonth - i));
        calendarGrid.appendChild(dayDiv);
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const dayDiv = createDayCell(i, isToday ? 'today' : '', new Date(year, month, i));
        calendarGrid.appendChild(dayDiv);
    }

    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
        const dayDiv = createDayCell(i, 'other-month', new Date(year, month + 1, i));
        calendarGrid.appendChild(dayDiv);
    }
}

function createDayCell(dayNumber, className, dateObj) {
    const div = document.createElement('div');
    div.className = `day-cell ${className}`;
    
    // Check for Weekend (0 = Sunday, 6 = Saturday)
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        div.classList.add('weekend');
    }
    
    const dateString = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    const numDiv = document.createElement('div');
    numDiv.className = 'day-number';
    numDiv.textContent = dayNumber;
    div.appendChild(numDiv);

    let isHoliday = false;

    if (events[dateString]) {
        events[dateString].forEach(event => {
            const badge = document.createElement('div');
            badge.className = `event-badge ${event.type}`;
            badge.textContent = `${event.time ? event.time + ' ' : ''}${event.title}`;
            div.appendChild(badge);
            
            // Flag if the event is a holiday
            if (event.type === 'holiday') {
                isHoliday = true;
            }
        });
    }

    // Color the entire cell green if it's a holiday
    if (isHoliday) {
        div.classList.add('holiday-cell');
    }

    div.addEventListener('click', () => openModal(dateString));
    return div;
}

function openModal(dateStr) {
    selectedDateString = dateStr;
    selectedDateSpan.textContent = dateStr;
    modal.classList.remove('hidden');
    document.getElementById('event-title').focus();
}

function closeModal() {
    modal.classList.add('hidden');
    eventForm.reset();
    selectedDateString = null;
}

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title').value;
    const type = document.getElementById('event-type').value;
    const time = document.getElementById('event-time').value;

    if (!events[selectedDateString]) {
        events[selectedDateString] = [];
    }

    events[selectedDateString].push({ title, type, time });
    events[selectedDateString].sort((a, b) => a.time.localeCompare(b.time));
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    
    closeModal();
    renderCalendar();
});

cancelBtn.addEventListener('click', closeModal);
prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
todayBtn.addEventListener('click', () => { currentDate = new Date(); renderCalendar(); });

renderCalendar();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('ServiceWorker registration successful'))
            .catch(err => console.log('ServiceWorker registration failed: ', err));
    });
}
