
document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Config ---
    const firebaseConfig = {
        apiKey: "AIzaSyBPTUgBQVsdQ8zsHCmE6CtjcL3LASoweLs",
        authDomain: "my-family-in-canada-8348-d04e1.firebaseapp.com",
        projectId: "my-family-in-canada-8348-d04e1",
        storageBucket: "my-family-in-canada-8348-d04e1.appspot.com",
        messagingSenderId: "1043656805377",
        appId: "1:1043656805377:web:902d6f8dc9dcbb95be4400"
    };
    firebase.initializeApp(firebaseConfig);
    const storage = firebase.storage(); // Initialize Firebase Storage

    // --- Google Calendar Config ---
    const GOOGLE_CALENDAR_API_KEY = 'AIzaSyBPTUgBQVsdQ8zsHCmE6CtjcL3LASoweLs';
    const GOOGLE_CALENDAR_ID = 'tigerjk726@gmail.com';

    // --- DOM Element References ---
    const themeToggle = document.getElementById('theme-toggle');
    const links = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    const lottoButtons = document.querySelectorAll('.lotto-button');
    const lottoDisplay = document.getElementById('lotto-display-area');
    // Gallery Elements
    const fileInput = document.getElementById('file-input');
    const uploadButton = document.getElementById('upload-button');
    const uploadProgress = document.getElementById('upload-progress');
    const galleryContainer = document.getElementById('gallery-container');


    // --- Theme Toggle ---
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

    // --- Navigation ---
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
        if (!calendarEl || calendar) {
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
                className: 'gcal-event'
            },
            editable: false,
            eventClick: function(info) {
                if (info.event.url) {
                    info.jsEvent.preventDefault();
                    window.open(info.event.url, '_blank');
                }
            }
        });
        calendar.render();
    }
    
    // --- Photo Gallery Logic ---

    // 1. Function to load and display existing images from Storage
    async function loadAndDisplayImages() {
        const storageRef = storage.ref('images');
        try {
            const result = await storageRef.listAll();
            galleryContainer.innerHTML = ''; // Clear gallery before loading
            const sortedItems = result.items.sort((a, b) => b.name.localeCompare(a.name)); // Sort by name (newest first)

            for (const imageRef of sortedItems) {
                const url = await imageRef.getDownloadURL();
                displayImage(url);
            }
        } catch (error) {
            console.error("Error loading images: ", error);
        }
    }

    // 2. Function to create and append an image element to the gallery
    function displayImage(url) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Uploaded family photo";

        galleryItem.appendChild(img);
        galleryContainer.appendChild(galleryItem);
    }

    // 3. Function to handle the file upload process
    function handleUpload() {
        const file = fileInput.files[0];
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const timestamp = new Date().getTime();
        const filename = `${timestamp}-${file.name}`;
        const storageRef = storage.ref(`images/${filename}`);
        
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                uploadProgress.style.display = 'block';
                uploadProgress.value = progress;
            },
            (error) => {
                console.error("Upload failed:", error);
                alert(`Upload failed. Error: ${error.code}`);
                uploadProgress.style.display = 'none';
            },
            () => {
                uploadProgress.style.display = 'none';
                fileInput.value = ''; 
                alert('Photo uploaded successfully!');
                loadAndDisplayImages();
            }
        );
    }

    // Add event listener to the upload button
    uploadButton.addEventListener('click', handleUpload);


    // --- Hash-based Routing ---
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
            setTimeout(initializeCalendar, 0);
        }
        if (hash === 'gallery') {
            loadAndDisplayImages(); // Load images when gallery is viewed
        }
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load based on hash

    // --- Lottery Generator --- (This code remains unchanged)
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
