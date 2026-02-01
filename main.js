
class LottoGenerator extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
      }
      button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s ease, transform 0.2s ease;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      button:hover {
        background-color: #0056b3;
        transform: translateY(-2px);
      }
      button:active {
        transform: translateY(0);
        background-color: #004494;
      }
      .numbers {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 1rem;
      }
      .number {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 1.4rem;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.3s ease;
      }
      .number:hover {
        transform: scale(1.1);
      }
    `;

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'wrapper');

    const button = document.createElement('button');
    button.textContent = 'Generate Lucky Numbers';

    const numbersContainer = document.createElement('div');
    numbersContainer.setAttribute('class', 'numbers');

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    wrapper.appendChild(button);
    wrapper.appendChild(numbersContainer);

    button.addEventListener('click', () => {
      const numbers = this.generateNumbers();
      this.displayNumbers(numbers, numbersContainer);
    });
  }

  generateNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
      const randomNumber = Math.floor(Math.random() * 45) + 1;
      numbers.add(randomNumber);
    }
    return Array.from(numbers).sort((a, b) => a - b);
  }

  displayNumbers(numbers, container) {
    container.innerHTML = '';
    numbers.forEach(number => {
      const numberEl = document.createElement('div');
      numberEl.setAttribute('class', 'number');
      numberEl.textContent = number;
      numberEl.style.backgroundColor = this.getNumberColor(number);
      container.appendChild(numberEl);
    });
  }

  getNumberColor(number) {
    if (number <= 10) return '#fbc400'; // Yellow
    if (number <= 20) return '#69c8f2'; // Blue
    if (number <= 30) return '#ff7272'; // Red
    if (number <= 40) return '#aaa';    // Gray
    return '#b0d840';                   // Green
  }
}

customElements.define('lotto-generator', LottoGenerator);

document.addEventListener('DOMContentLoaded', () => {
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

    // Initial load
    handleHashChange();
});
