document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation ---
    const links = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    function showSection(id) {
        sections.forEach(section => {
            section.style.display = section.id === id ? 'block' : 'none';
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            window.location.hash = sectionId;
        });
    });

    function handleHashChange() {
        const hash = window.location.hash.substring(1) || 'home';
        showSection(hash);
        links.forEach(l => {
            if (l.getAttribute('href').substring(1) === hash) {
                l.classList.add('active');
            } else {
                l.classList.remove('active');
            }
        });
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // On load, check for saved theme
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Lotto Generator ---
    const lottoControls = document.getElementById('lotto-controls');
    const displayArea = document.getElementById('lotto-display-area');

    lottoControls.addEventListener('click', (e) => {
        if (e.target.classList.contains('lotto-button')) {
            const type = e.target.dataset.lottoType;
            generateAndDisplayNumbers(type);
        }
    });

    function generateAndDisplayNumbers(type) {
        let numbersHtml = '';
        let generatedNumbers;

        switch (type) {
            case 'korea-645':
                generatedNumbers = generateUniqueNumbers(6, 1, 45);
                numbersHtml = createNumberBalls(generatedNumbers);
                break;
            case 'korea-720':
                const group = Math.floor(Math.random() * 5) + 1;
                const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
                numbersHtml = `<div class="number-set"><h3>${group}조 ${digits}</h3></div>`;
                break;
            case 'usa-powerball':
                const powerballMain = generateUniqueNumbers(5, 1, 69);
                const powerballNum = generateUniqueNumbers(1, 1, 26);
                numbersHtml = createNumberBalls(powerballMain) +
                              '<div class="separator">+</div>' +
                              createNumberBalls(powerballNum, true);
                break;
            case 'usa-megamillions':
                const megaMain = generateUniqueNumbers(5, 1, 70);
                const megaNum = generateUniqueNumbers(1, 1, 25);
                numbersHtml = createNumberBalls(megaMain) +
                              '<div class="separator">+</div>' +
                              createNumberBalls(megaNum, true);
                break;
            case 'canada-649':
                generatedNumbers = generateUniqueNumbers(6, 1, 49);
                numbersHtml = createNumberBalls(generatedNumbers);
                break;
            case 'canada-lottomax':
                generatedNumbers = generateUniqueNumbers(7, 1, 50);
                numbersHtml = createNumberBalls(generatedNumbers);
                break;
        }

        displayArea.innerHTML = `<div class="numbers">${numbersHtml}</div>`;
    }
    
    function generateUniqueNumbers(count, min, max) {
        const numbers = new Set();
        while (numbers.size < count) {
            const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            numbers.add(randomNumber);
        }
        return Array.from(numbers).sort((a, b) => a - b);
    }

    function createNumberBalls(numbers, isSpecial = false) {
        return numbers.map(number => {
            const color = isSpecial ? '#ff7272' : getNumberColor(number);
            return `<div class="number" style="background-color: ${color};">${number}</div>`;
        }).join('');
    }

    function getNumberColor(number) {
        if (number <= 10) return '#fbc400'; // Yellow
        if (number <= 20) return '#69c8f2'; // Blue
        if (number <= 30) return '#ff7272'; // Red
        if (number <= 40) return '#aaa';    // Gray
        return '#b0d840';                   // Green
    }
});
