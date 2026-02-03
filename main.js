
document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Config (App initialization is kept for potential future use) ---
    const firebaseConfig = {
        apiKey: "AIzaSyBPTUgBQVsdQ8zsHCmE6CtjcL3LASoweLs",
        authDomain: "my-family-in-canada-8348-d04e1.firebaseapp.com",
        projectId: "my-family-in-canada-8348-d04e1",
        storageBucket: "my-family-in-canada-8348-d04e1.appspot.com",
        messagingSenderId: "1043656805377",
        appId: "1:1043656805377:web:902d6f8dc9dcbb95be4400"
    };
    firebase.initializeApp(firebaseConfig);

    // --- Google Calendar Config ---
    const GOOGLE_CALENDAR_API_KEY = 'AIzaSyBPTUgBQVsdQ8zsHCmE6CtjcL3LASoweLs';
    const GOOGLE_CALENDAR_ID = 'tigerjk726@gmail.com';

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀️';
        }
    });

    // Navigation
    const links = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    function showSection(id) {
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === id) {
                section.classList.add('active');
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            window.location.hash = sectionId;
        });
    });

    let calendar; // To hold the calendar instance

    function initializeCalendar() {
        const calendarEl = document.getElementById('calendar-container');
        if (!calendarEl || calendar) { // If no element or calendar is already initialized
             return;
        }
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            googleCalendarApiKey: GOOGLE_CALENDAR_API_KEY,
            events: {
                googleCalendarId: GOOGLE_CALENDAR_ID,
                className: 'gcal-event' // Optional: for custom styling
            },
            editable: false, // Google Calendar events are read-only via API Key
            eventClick: function(info) {
                // For GCal events, info.event.url is the link to the event
                if (info.event.url) {
                    info.jsEvent.preventDefault(); // Prevent browser from following the a-tag's href
                    window.open(info.event.url, '_blank'); // Open in a new tab
                }
            }
        });

        calendar.render();
    }

    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        links.forEach(l => {
            l.classList.remove('active');
            if (l.getAttribute('href').substring(1) === hash) {
                l.classList.add('active');
            }
        });
        if (hash === 'calendar') {
            // Use a slight delay to ensure the section is visible before rendering
            setTimeout(initializeCalendar, 0);
        }
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    // --- Lottery Generator --- (This code remains unchanged)
    const lottoButtons = document.querySelectorAll('.lotto-button');
    const lottoDisplay = document.getElementById('lotto-display-area');

    lottoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.lottoType;
            const numbers = generateLottoNumbers(type);
            displayLottoNumbers(numbers, type);
        });
    });

    function generateLottoNumbers(type) {
        let balls = [];
        switch (type) {
            case 'korea-645':
                balls = [{ count: 6, max: 45, color: '#fbc400' }];
                break;
            case 'korea-720':
                const group = Math.floor(Math.random() * 5) + 1;
                let rest = generateUniqueNumbers(6, 0, 9).map(n => n.val).join('');
                return { type: 'structured', numbers: [group, ...rest.split('')] };
            case 'usa-powerball':
                balls = [
                    { count: 5, max: 69, color: '#e44d26', textColor: '#fff' },
                    { count: 1, max: 26, color: '#fbc400', textColor: '#fff' }
                ];
                break;
            case 'usa-megamillions':
                balls = [
                    { count: 5, max: 70, color: '#2c3e50', textColor: '#fff' },
                    { count: 1, max: 25, color: '#fbc400', textColor: '#fff' }
                ];
                break;
            case 'canada-649':
                balls = [{ count: 6, max: 49, color: '#5cb85c', textColor: '#fff' }];
                break;
            case 'canada-lottomax':
                balls = [{ count: 7, max: 50, color: '#5bc0de', textColor: '#fff' }];
                break;
        }

        const generated = balls.map(b => generateUniqueNumbers(b.count, 1, b.max, b.color, b.textColor));
        return { type: 'balls', numbers: generated.flat() };
    }

    function generateUniqueNumbers(count, min, max, color, textColor) {
        let numbers = new Set();
        while (numbers.size < count) {
            numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return Array.from(numbers).sort((a, b) => a - b).map(n => ({ val: n, color, textColor }));
    }

    function displayLottoNumbers(result, type) {
        lottoDisplay.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'lotto-numbers-container';

        if (result.type === 'structured') {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'pension-lotto-group';
            groupDiv.innerHTML = `<strong>${result.numbers[0]}조</strong>`;
            container.appendChild(groupDiv);

            const digitsDiv = document.createElement('div');
            digitsDiv.className = 'pension-lotto-digits';
            result.numbers.slice(1).forEach(digit => {
                const digitSpan = document.createElement('span');
                digitSpan.className = 'number-ball pension-digit-ball';
                digitSpan.textContent = digit;
                digitsDiv.appendChild(digitSpan);
            });
            container.appendChild(digitsDiv);

        } else { // type === 'balls'
            result.numbers.forEach(num => {
                const ball = document.createElement('div');
                ball.className = 'number-ball';
                ball.textContent = num.val;
                ball.style.backgroundColor = num.color || '#ddd';
                ball.style.color = num.textColor || '#333';
                if (document.documentElement.getAttribute('data-theme') === 'dark' && num.color === '#fff') {
                    ball.style.color = '#1e1e1e';
                }
                container.appendChild(ball);
            });
        }
        lottoDisplay.appendChild(container);
    }
});
