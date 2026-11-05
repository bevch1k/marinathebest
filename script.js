/**
 * Интерактивный опросник для Марины 🌸
 * Цвета: розовый, белый, фиолетовый
 * Без AI слоп — с душой, улыбкой и зелёным зайчиком 🐰💚
 */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // Данные вопросов
    // --------------------------------------------------------------------------
    const questions = [
        {
            id: 1,
            emoji: '💌',
            text: 'Как ты относишься к неожиданным просьбам?',
            options: [
                { text: 'Положительно', feedback: 'О, это просто замечательно! 💫' },
                { text: 'Зависит от просьбы', feedback: 'Очень рассудительно и справедливо 😉' },
                { text: 'Уже немного страшно', feedback: 'Не бойся, никто не укусит! 🙈✨' }
            ]
        },
        {
            id: 2,
            emoji: '🎁',
            text: 'Как считаешь, могут ли маленькие подарки сделать чей-то день лучше?',
            options: [
                { text: 'Конечно!', feedback: 'Именно так! Магия всегда в мелочах ✨' },
                { text: 'Безусловно', feedback: 'Золотые слова! 💖' },
                { text: 'Зависит от подарка', feedback: 'Особенно если подарок зелёный и пушистый? 🌿' }
            ]
        },
        {
            id: 3,
            emoji: '🐰',
            text: 'Какой цвет лучше всего подходит нфт зайчику?',
            special: true,
            options: [
                { text: 'Зелёный 💚', feedback: 'Идеальный выбор! Самый сочный оттенок 🍃' },
                { text: 'Очень зелёный', feedback: 'Максимальная концентрация милоты! 🍀' },
                { text: 'Салатовый', feedback: 'Свежо, ярко и прямо в яблочко! 🍏' }
            ]
        },
        {
            id: 4,
            emoji: '🌟',
            text: 'Как часто ты делаешь добро?',
            options: [
                { text: 'Каждый день', feedback: 'Ангел во плоти! 😇' },
                { text: 'Немного', feedback: 'Каждое маленькое доброе дело имеет значение 🌱' },
                { text: 'Практически не делаю', feedback: 'Зато прямо сейчас есть идеальный шанс начать! 😜' }
            ]
        },
        {
            id: 5,
            emoji: '🔮',
            text: 'Готова узнать одну необычную просьбу?',
            options: [
                { text: 'Да, интересно', feedback: 'Барабанная дробь... 🥁' },
                { text: 'Давай уже', feedback: 'Полетели! 🚀✨' }
            ]
        }
    ];

    // --------------------------------------------------------------------------
    // Состояние приложения
    // --------------------------------------------------------------------------
    let currentStep = 0; // 0 = Intro, 1..5 = Questions, 6 = Final
    let soundEnabled = true;
    let selectedAnswers = {};
    let thinkTries = 0;

    // --------------------------------------------------------------------------
    // DOM Элементы
    // --------------------------------------------------------------------------
    const introScreen = document.getElementById('intro-screen');
    const questionScreen = document.getElementById('question-screen');
    const finalScreen = document.getElementById('final-screen');

    const progressWrapper = document.getElementById('progress-wrapper');
    const progressFill = document.getElementById('progress-fill');
    const stepIndicator = document.getElementById('step-indicator');
    const percentIndicator = document.getElementById('percent-indicator');
    const trackBunny = document.getElementById('track-bunny');

    const startQuizBtn = document.getElementById('start-quiz-btn');
    const qEmoji = document.getElementById('q-emoji');
    const qText = document.getElementById('q-text');
    const optionsContainer = document.getElementById('options-container');
    const feedbackBanner = document.getElementById('feedback-banner');
    const feedbackText = document.getElementById('feedback-text');
    const backBtn = document.getElementById('back-btn');

    const soundBtn = document.getElementById('sound-btn');
    const soundIconOn = document.getElementById('sound-icon-on');
    const soundIconOff = document.getElementById('sound-icon-off');

    const yesBtn = document.getElementById('yes-btn');
    const thinkBtn = document.getElementById('think-btn');
    const thinkBtnText = document.getElementById('think-btn-text');

    const successModal = document.getElementById('success-modal');
    const copyBtn = document.getElementById('copy-btn');
    const copyBtnText = document.getElementById('copy-btn-text');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const copyText = document.getElementById('copy-text');

    // --------------------------------------------------------------------------
    // Web Audio API Звуковые эффекты (без внешних аудио файлов)
    // --------------------------------------------------------------------------
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    // Мягкий звук клика
    function playPopSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(540, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {
            // Тихо игнорируем если аудио заблокировано браузером
        }
    }

    // Торжественный арпеджио-аккорд для финала
    function playChimeSound() {
        if (!soundEnabled) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                const now = ctx.currentTime + idx * 0.09;
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(0.14, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now);
                osc.stop(now + 0.45);
            });
        } catch (e) {}
    }

    // Переключение звука
    soundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundIconOn.classList.remove('hidden');
            soundIconOff.classList.add('hidden');
            playPopSound();
        } else {
            soundIconOn.classList.add('hidden');
            soundIconOff.classList.remove('hidden');
        }
    });

    // --------------------------------------------------------------------------
    // Фоновые мерцающие искорки
    // --------------------------------------------------------------------------
    function createSparkles() {
        const container = document.getElementById('sparkles-container');
        if (!container) return;
        const count = 18;

        for (let i = 0; i < count; i++) {
            const dot = document.createElement('div');
            dot.className = 'sparkle-dot';
            const size = Math.random() * 5 + 3;
            dot.style.width = `${size}px`;
            dot.style.height = `${size}px`;
            dot.style.top = `${Math.random() * 100}%`;
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.animationDelay = `${Math.random() * 4}s`;
            dot.style.animationDuration = `${Math.random() * 3 + 2.5}s`;
            container.appendChild(dot);
        }
    }
    createSparkles();

    // --------------------------------------------------------------------------
    // Навигация и переключение экранов
    // --------------------------------------------------------------------------
    function showScreen(screen) {
        [introScreen, questionScreen, finalScreen].forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });

        screen.style.display = 'block';
        // Force reflow for silky animation
        void screen.offsetWidth;
        screen.classList.add('active');
    }

    function updateProgress(step) {
        if (step === 0) {
            progressWrapper.style.opacity = '0';
            progressWrapper.style.pointerEvents = 'none';
            return;
        }

        progressWrapper.style.opacity = '1';
        progressWrapper.style.pointerEvents = 'auto';

        const total = questions.length;
        const percent = Math.min(100, Math.round((step / total) * 100));

        progressFill.style.width = `${percent}%`;
        stepIndicator.textContent = `Вопрос ${step} из ${total}`;
        percentIndicator.textContent = `${percent}%`;

        // Bunny rotation on progress
        if (trackBunny) {
            trackBunny.style.transform = `scale(1.2) rotate(${step % 2 === 0 ? 10 : -10}deg)`;
            setTimeout(() => {
                trackBunny.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        }
    }

    function renderQuestion(index) {
        const q = questions[index];
        qEmoji.textContent = q.emoji;
        qText.textContent = q.text;

        feedbackBanner.classList.remove('show');
        optionsContainer.innerHTML = '';

        q.options.forEach((opt, optIdx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            if (q.special) {
                btn.classList.add('special-green');
            }

            if (selectedAnswers[q.id] === optIdx) {
                btn.classList.add('selected');
            }

            btn.innerHTML = `
                <span class="option-text">${opt.text}</span>
                <span class="option-indicator">
                    <svg class="option-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </span>
            `;

            btn.addEventListener('click', () => handleOptionSelect(q, opt, optIdx, btn));
            optionsContainer.appendChild(btn);
        });

        // На первом вопросе кнопка "Назад" возвращает на интро
        backBtn.style.visibility = 'visible';
    }

    function handleOptionSelect(question, option, optionIndex, btnElement) {
        playPopSound();
        selectedAnswers[question.id] = optionIndex;

        // Visual selection
        const allBtns = optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.classList.remove('selected'));
        btnElement.classList.add('selected');

        // Feedback reaction
        feedbackText.textContent = option.feedback;
        feedbackBanner.classList.add('show');

        // Smooth automatic advance after short pleasant pause
        setTimeout(() => {
            currentStep++;
            if (currentStep <= questions.length) {
                updateProgress(currentStep);
                renderQuestion(currentStep - 1);
            } else {
                renderFinal();
            }
        }, 500);
    }

    // Финальный экран
    function renderFinal() {
        showScreen(finalScreen);
        updateProgress(5);
        stepIndicator.textContent = 'Финал ✨';
        percentIndicator.textContent = '100%';
        progressFill.style.width = '100%';

        playChimeSound();
        triggerConfetti(0.4);

        // Blinking animation for NFT Bunny
        startBunnyBlinking();
    }

    // --------------------------------------------------------------------------
    // NFT Bunny Interactive Blinking
    // --------------------------------------------------------------------------
    let blinkInterval = null;
    function startBunnyBlinking() {
        if (blinkInterval) clearInterval(blinkInterval);
        const eyeL = document.getElementById('eye-l');
        const eyeR = document.getElementById('eye-r');
        if (!eyeL || !eyeR) return;

        blinkInterval = setInterval(() => {
            eyeL.style.transform = 'scaleY(0.1)';
            eyeR.style.transform = 'scaleY(0.1)';
            eyeL.style.transformOrigin = '94px 114px';
            eyeR.style.transformOrigin = '146px 114px';

            setTimeout(() => {
                eyeL.style.transform = 'scaleY(1)';
                eyeR.style.transform = 'scaleY(1)';
            }, 180);
        }, 3600);
    }

    // --------------------------------------------------------------------------
    // Запуск опроса
    // --------------------------------------------------------------------------
    startQuizBtn.addEventListener('click', () => {
        playPopSound();
        currentStep = 1;
        updateProgress(currentStep);
        renderQuestion(0);
        showScreen(questionScreen);
    });

    backBtn.addEventListener('click', () => {
        playPopSound();
        if (currentStep > 1) {
            currentStep--;
            updateProgress(currentStep);
            renderQuestion(currentStep - 1);
        } else {
            currentStep = 0;
            updateProgress(0);
            showScreen(introScreen);
        }
    });

    // --------------------------------------------------------------------------
    // Финальные действия: Кнопки "Да" и "Надо подумать"
    // --------------------------------------------------------------------------
    const playfulPleaList = [
        'А если с вкусняшкой? 🍫',
        'А если с ароматным кофе и круассаном? ☕🥐',
        'А если с миллионом комплиментов? 🌸',
        'Ну посмотри, какой он милый! 🥺💚',
        'Уговорил, согласна! 🥰'
    ];

    thinkBtn.addEventListener('click', () => {
        playPopSound();
        if (thinkTries < playfulPleaList.length - 1) {
            thinkBtnText.textContent = playfulPleaList[thinkTries];
            thinkTries++;
            // Cute wiggle
            thinkBtn.style.transform = 'scale(0.95)';
            setTimeout(() => { thinkBtn.style.transform = 'scale(1)'; }, 150);
        } else {
            // Last plea triggers agreement
            thinkBtnText.textContent = playfulPleaList[playfulPleaList.length - 1];
            setTimeout(() => {
                handleYesClick();
            }, 300);
        }
    });

    yesBtn.addEventListener('click', () => {
        handleYesClick();
    });

    function handleYesClick() {
        playChimeSound();
        triggerMassiveConfetti();
        successModal.classList.add('active');
    }

    // --------------------------------------------------------------------------
    // Модальное окно и Копирование
    // --------------------------------------------------------------------------
    copyBtn.addEventListener('click', async () => {
        playPopSound();
        const textToCopy = copyText.textContent.replace(/^«|»$/g, '');
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const ta = document.createElement('textarea');
                ta.value = textToCopy;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            copyBtnText.textContent = 'Скопировано! Отправляй скорее 💌';
            triggerConfetti(0.2);
            setTimeout(() => {
                copyBtnText.textContent = 'Скопировать для автора 📋';
            }, 3000);
        } catch (e) {
            copyBtnText.textContent = 'Выдели и скопируй вручную 💕';
        }
    });

    closeModalBtn.addEventListener('click', () => {
        playPopSound();
        successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

    // --------------------------------------------------------------------------
    // Конфетти (с Fallback если CDN недоступен)
    // --------------------------------------------------------------------------
    function triggerConfetti(intensity = 0.5) {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: Math.round(50 * intensity + 30),
                spread: 70,
                origin: { y: 0.65 },
                colors: ['#ec4899', '#a855f7', '#34d399', '#fbcfe8', '#facc15']
            });
        }
    }

    function triggerMassiveConfetti() {
        if (typeof confetti !== 'function') return;

        const count = 200;
        const defaults = {
            origin: { y: 0.6 },
            colors: ['#ec4899', '#a855f7', '#34d399', '#10b981', '#f472b6', '#ffffff']
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    }

    // Инициализация
    updateProgress(0);
});
