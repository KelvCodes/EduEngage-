
// Sample Data
let userData = {
    email: "student@example.com",
    username: "Kwaku",
    profileImage: "assets/images/default-avatar.png",
    points: 150,
    badges: ["Math Pioneer"],
    level: 3,
    coursesCompleted: 2,
    forumPosts: 1,
    streak: 5,
    progress: { 1: 50, 2: 100 },
    language: "en",
    learningStyle: "kinesthetic",
    notes: {},
    activityLog: []
};

let forumPosts = [
    { user: "Kwaku", content: "Tips for mastering Python?", timestamp: "2025-03-21", aiModerated: "Positive 😊", likes: 0 }
];

const quizQuestions = [
    { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
    { question: "What gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], answer: "Carbon Dioxide" },
    { question: "Who wrote Romeo and Juliet?", options: ["Shakespeare", "Dickens", "Austen", "Hemingway"], answer: "Shakespeare" },
    { question: "What is Python?", options: ["A snake", "A programming language", "A fruit", "A car"], answer: "A programming language" }
];

const memoryPairs = [
    { id: 1, value: "Apple", match: 1 },
    { id: 2, value: "Apple", match: 1 },
    { id: 3, value: "Planet", match: 2 },
    { id: 4, value: "Planet", match: 2 },
    { id: 5, value: "Code", match: 3 },
    { id: 6, value: "Code", match: 3 },
    { id: 7, value: "History", match: 4 },
    { id: 8, value: "History", match: 4 }
];

const scrambleWords = [
    { scrambled: "pleap", original: "apple" },
    { scrambled: "tarhe", original: "earth" },
    { scrambled: "dcoign", original: "coding" },
    { scrambled: "rtohisy", original: "history" }
];

// Lazy Load Observer
const lazyLoad = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            lazyLoad.unobserve(entry.target);
        }
    });
}, { rootMargin: '0px 0px 100px 0px' });

// Utility Functions
function setupUI() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const logoutBtn = document.getElementById('logout');
    const offlineToggle = document.getElementById('offline-toggle');
    if (menuToggle && sidebar) menuToggle.onclick = () => sidebar.classList.toggle('-translate-x-full');
    if (logoutBtn) logoutBtn.onclick = () => {
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    };
    if (offlineToggle) offlineToggle.onclick = () => {
        const isOffline = localStorage.getItem('offlineMode') === 'true';
        localStorage.setItem('offlineMode', !isOffline);
        offlineToggle.innerHTML = `<i class="fas fa-cloud-${!isOffline ? 'download-alt' : 'upload'} mr-2"></i><span>${!isOffline ? 'Offline' : 'Online'} Mode</span>`;
        alert(`Switched to ${!isOffline ? 'Offline' : 'Online'} Mode!`);
    };
    document.querySelectorAll('.lazy-load').forEach(el => lazyLoad.observe(el));
    updateSidebarProfile();
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function updateGamification(pointsEarned, action = "lesson") {
    userData.points += pointsEarned;
    if (userData.points >= userData.level * 100) {
        userData.level++;
        userData.badges.push(`Level ${userData.level} Star 🌟`);
        alert(`Level Up! Now Level ${userData.level}! 🎉`);
    }
    if (action === "forum") userData.forumPosts++;
    if (action === "courseComplete") {
        userData.coursesCompleted++;
        userData.streak++;
    }
    if (action === "quiz") userData.badges.push("Quiz Master 🎮");
    if (action === "memory") userData.badges.push("Memory Guru 🧠");
    if (action === "scramble") userData.badges.push("Word Wizard ✍️");
    userData.activityLog.unshift(`${action.charAt(0).toUpperCase() + action.slice(1)} completed - ${new Date().toLocaleString()}`);
    localStorage.setItem('userData', JSON.stringify(userData));
    updateDashboard();
    updateProfile();
}

function updateSidebarProfile() {
    const sidebarImage = document.getElementById('sidebar-profile-image');
    const sidebarUsername = document.getElementById('sidebar-username');
    if (sidebarImage) sidebarImage.src = userData.profileImage;
    if (sidebarUsername) sidebarUsername.textContent = userData.username;
}

function showModal(type) {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('auth-form');
    modal.classList.remove('hidden');
    title.innerHTML = type === 'login' ? '<i class="fas fa-sign-in-alt mr-2"></i>Login' : '<i class="fas fa-user-plus mr-2"></i>Sign Up';
    form.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        userData.email = email;
        userData.username = email.split('@')[0];
        localStorage.setItem('userData', JSON.stringify(userData));
        hideModal();
        window.location.href = 'dashboard.html';
    };
}

function hideModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function updateDashboard() {
    const usernameEl = document.getElementById('dashboard-username');
    const pointsEl = document.getElementById('points');
    const levelEl = document.getElementById('level');
    const coursesEl = document.getElementById('courses-completed');
    const streakEl = document.getElementById('streak');
    const quoteEl = document.getElementById('quote');
    if (usernameEl) usernameEl.textContent = userData.username;
    if (pointsEl) pointsEl.textContent = userData.points;
    if (levelEl) levelEl.textContent = `Level ${userData.level}`;
    if (coursesEl) coursesEl.textContent = userData.coursesCompleted;
    if (streakEl) streakEl.textContent = userData.streak;
    if (quoteEl) {
        const quotes = [
            "Knowledge is power, wield it wisely.",
            "Every challenge is a chance to grow.",
            "Mastery is the reward of persistence."
        ];
        quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }
}

function updateProfile() {
    const emailEl = document.getElementById('profile-email');
    const pointsEl = document.getElementById('profile-points');
    const levelEl = document.getElementById('profile-level');
    const usernameInput = document.getElementById('username-input');
    const profileImage = document.getElementById('profile-image');
    if (emailEl) emailEl.innerHTML = `<i class="fas fa-envelope mr-2"></i>${userData.email}`;
    if (pointsEl) pointsEl.textContent = userData.points;
    if (levelEl) levelEl.textContent = userData.level;
    if (usernameInput) usernameInput.value = userData.username;
    if (profileImage) profileImage.src = userData.profileImage;
    updateSidebarProfile();
}

async function moderatePost(text) {
    const score = Math.random();
    return score > 0.8 ? "Positive 😊" : score < 0.4 ? "Negative 😞" : "Neutral 😐";
}

async function chatbotResponse(query) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('math')) return "Try Math Course 1 or the Quick Quiz game! 🧠";
    if (lowerQuery.includes('science')) return "Explore Science Course 1! 🔬";
    if (lowerQuery.includes('game')) return "Check out Quick Quiz, Memory Match, or Word Scramble in the Games section! 🎮";
    return "Ask me about courses or games! 😊";
}

function renderForumPosts(sort = 'newest') {
    const postsSection = document.getElementById('forum-posts');
    if (!postsSection) return;
    postsSection.innerHTML = '';
    const sortedPosts = [...forumPosts].sort((a, b) => {
        if (sort === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
        if (sort === 'oldest') return new Date(a.timestamp) - new Date(a.timestamp);
        if (sort === 'popular') return b.likes - a.likes;
    });
    sortedPosts.forEach((post, idx) => {
        const postDiv = document.createElement('div');
        postDiv.className = 'forum-post animate-slide-in';
        postDiv.innerHTML = `
            <p><strong>${post.user}</strong> (${post.timestamp}): ${post.content}</p>
            <p class="text-gray-400"><i class="fas fa-robot mr-1"></i>${post.aiModerated}</p>
            <button class="mt-2" onclick="likePost(${idx})"><i class="fas fa-thumbs-up mr-1"></i>${post.likes} Likes</button>
        `;
        postsSection.appendChild(postDiv);
    });
}

function likePost(index) {
    forumPosts[index].likes++;
    renderForumPosts(document.getElementById('sort-posts')?.value || 'newest');
}

function loadLessonDetail(lessonId) {
    const predefinedCourses = Array.from({ length: 100 }, (_, i) => {
        const categories = ['Math', 'Science', 'History', 'Programming', 'Language', 'Art'];
        const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
        const category = categories[i % categories.length];
        const pdfs = {
            Math: [{ title: "Algebra Basics", url: "https://example.com/algebra.pdf" }],
            Science: [{ title: "Physics Intro", url: "https://example.com/physics.pdf" }],
            History: [{ title: "Ancient Times", url: "https://example.com/history.pdf" }],
            Programming: [{ title: "Python Basics", url: "https://example.com/python.pdf" }],
            Language: [{ title: "Spanish 101", url: "https://example.com/spanish.pdf" }],
            Art: [{ title: "Drawing 101", url: "https://example.com/drawing.pdf" }]
        };
        const exercises = {
            Math: [{ question: "Solve: 2x + 3 = 7", answer: "2" }],
            Science: [{ question: "What is H2O?", answer: "water" }],
            History: [{ question: "Year of Magna Carta?", answer: "1215" }],
            Programming: [{ question: "Python print command?", answer: "print" }],
            Language: [{ question: "Hello in Spanish?", answer: "hola" }],
            Art: [{ question: "Primary colors?", answer: "red, blue, yellow" }]
        };
        return {
            id: i + 1,
            title: `${category} Course ${i + 1}`,
            description: `Master ${category.toLowerCase()} with engaging lessons!`,
            progress: userData.progress[i + 1] || 0,
            difficulty: difficulties[Math.floor(i / 33) % 3],
            category,
            video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            pdfs: pdfs[category],
            exercises: exercises[category]
        };
    });

    const lesson = predefinedCourses.find(c => c.id === parseInt(lessonId));
    if (!lesson) return;
    document.getElementById('lesson-title').innerHTML = `<i class="fas fa-chalkboard-teacher mr-2"></i>${lesson.title}`;
    document.getElementById('lesson-description').textContent = lesson.description;
    document.getElementById('lesson-difficulty').textContent = lesson.difficulty;
    document.getElementById('lesson-category').textContent = lesson.category;
    document.getElementById('lesson-video').dataset.src = lesson.video;
    document.getElementById('lesson-progress-bar').style.width = `${lesson.progress}%`;
    document.getElementById('progress-text').textContent = `${lesson.progress}% Complete`;
    document.getElementById('lesson-notes').value = userData.notes[lessonId] || '';

    const pdfList = document.getElementById('pdf-resources');
    pdfList.innerHTML = lesson.pdfs.map(pdf => `
        <div class="lesson-card animate-slide-in">
            <p class="font-semibold"><i class="fas fa-file-pdf mr-2"></i>${pdf.title}</p>
            <a href="${pdf.url}" target="_blank" class="mt-2 block hover:text-gold-400"><i class="fas fa-download mr-1"></i>Download</a>
        </div>
    `).join('');

    const exercisesDiv = document.getElementById('exercises');
    exercisesDiv.innerHTML = lesson.exercises.map((ex, idx) => `
        <div class="lesson-card animate-slide-in">
            <p class="font-semibold"><i class="fas fa-question-circle mr-2"></i>${ex.question}</p>
            <input type="text" id="exercise-${idx}" class="w-full p-3 mt-2 rounded-lg text-gray-900" placeholder="Your answer...">
        </div>
    `).join('');

    const relatedDiv = document.getElementById('related-courses');
    const related = predefinedCourses.filter(c => c.category === lesson.category && c.id !== lesson.id).slice(0, 3);
    relatedDiv.innerHTML = related.map(c => `
        <div class="lesson-card animate-slide-in">
            <p class="font-semibold"><i class="fas fa-book mr-2"></i>${c.title}</p>
            <button class="mt-2" onclick="window.location.href='lesson-detail.html?id=${c.id}'"><i class="fas fa-play mr-1"></i>Start</button>
        </div>
    `).join('');

    document.getElementById('mark-complete').onclick = () => {
        lesson.progress = 100;
        userData.progress[lesson.id] = 100;
        updateGamification(25, 'courseComplete');
        loadLessonDetail(lessonId);
    };

    document.getElementById('save-notes').onclick = () => {
        userData.notes[lessonId] = document.getElementById('lesson-notes').value;
        localStorage.setItem('userData', JSON.stringify(userData));
        alert('Notes saved! 📝');
    };

    document.getElementById('submit-exercises').onclick = () => {
        let correct = 0;
        lesson.exercises.forEach((ex, idx) => {
            const answer = document.getElementById(`exercise-${idx}`).value.trim().toLowerCase();
            if (answer === ex.answer) correct++;
        });
        const feedback = document.getElementById('exercise-feedback');
        feedback.textContent = `You got ${correct} out of ${lesson.exercises.length} correct! ${correct === lesson.exercises.length ? '🎉 Perfect!' : 'Keep practicing!'}`;
        if (correct > 0) updateGamification(correct * 5);
    };
}

function loadQuiz() {
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-quiz');
    if (!questionEl || !optionsEl) return;

    const quiz = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    questionEl.textContent = quiz.question;
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';

    quiz.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-xl font-semibold transition w-full';
        btn.innerHTML = `<i class="fas fa-circle mr-2"></i>${option}`;
        btn.onclick = () => {
            feedbackEl.textContent = option === quiz.answer ? 'Correct! 🎉 +10 Points' : `Wrong! Correct answer: ${quiz.answer}`;
            if (option === quiz.answer) updateGamification(10, 'quiz');
            nextBtn.classList.remove('hidden');
        };
        optionsEl.appendChild(btn);
    });

    nextBtn.classList.add('hidden');
}

function loadMemoryGame() {
    const gameEl = document.getElementById('memory-game');
    const feedbackEl = document.getElementById('memory-feedback');
    const resetBtn = document.getElementById('reset-memory');
    if (!gameEl) return;

    let shuffledPairs = [...memoryPairs].sort(() => Math.random() - 0.5);
    let flippedCards = [];
    let matchedPairs = 0;

    gameEl.innerHTML = '';
    shuffledPairs.forEach((pair, idx) => {
        const card = document.createElement('div');
        card.className = 'bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center cursor-pointer';
        card.dataset.id = idx;
        card.dataset.match = pair.match;
        card.textContent = '?';
        card.onclick = () => {
            if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
                card.textContent = pair.value;
                card.classList.add('flipped');
                flippedCards.push(card);

                if (flippedCards.length === 2) {
                    const [card1, card2] = flippedCards;
                    if (card1.dataset.match === card2.dataset.match) {
                        matchedPairs++;
                        feedbackEl.textContent = `Match found! Pairs left: ${4 - matchedPairs}`;
                        flippedCards = [];
                        if (matchedPairs === 4) {
                            feedbackEl.textContent = 'You won! 🎉 +20 Points';
                            updateGamification(20, 'memory');
                        }
                    } else {
                        setTimeout(() => {
                            card1.textContent = '?';
                            card2.textContent = '?';
                            card1.classList.remove('flipped');
                            card2.classList.remove('flipped');
                            flippedCards = [];
                        }, 1000);
                    }
                }
            }
        };
        gameEl.appendChild(card);
    });

    resetBtn.onclick = () => loadMemoryGame();
}

function loadWordScramble() {
    const wordEl = document.getElementById('scramble-word');
    const inputEl = document.getElementById('scramble-input');
    const feedbackEl = document.getElementById('scramble-feedback');
    const submitBtn = document.getElementById('submit-scramble');
    const nextBtn = document.getElementById('next-scramble');
    if (!wordEl || !inputEl) return;

    const word = scrambleWords[Math.floor(Math.random() * scrambleWords.length)];
    wordEl.textContent = `Unscramble: ${word.scrambled}`;
    inputEl.value = '';
    feedbackEl.textContent = '';
    nextBtn.classList.add('hidden');

    submitBtn.onclick = () => {
        const answer = inputEl.value.trim().toLowerCase();
        if (answer === word.original) {
            feedbackEl.textContent = 'Correct! 🎉 +15 Points';
            updateGamification(15, 'scramble');
            nextBtn.classList.remove('hidden');
        } else {
            feedbackEl.textContent = `Wrong! Correct answer: ${word.original}`;
            nextBtn.classList.remove('hidden');
        }
    };

    nextBtn.onclick = () => loadWordScramble();
}

window.onload = () => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData) userData = storedData;
    setupUI();

    if (window.location.pathname.includes('index.html')) {
        const offlineToggle = document.getElementById('offline-toggle');
        if (offlineToggle) {
            const isOffline = localStorage.getItem('offlineMode') === 'true';
            offlineToggle.innerHTML = `<i class="fas fa-cloud-${isOffline ? 'upload' : 'download-alt'} mr-2"></i><span>${isOffline ? 'Online' : 'Offline'} Mode</span>`;
        }
    }

    if (window.location.pathname.includes('dashboard.html')) {
        updateDashboard();
        const aiInsightEl = document.getElementById('ai-insight');
        const chatbotBtn = document.getElementById('chatbot-btn');
        if (aiInsightEl) aiInsightEl.textContent = "Try Math Course 1, Science Course 1, or play the Quick Quiz game!";
        if (chatbotBtn) chatbotBtn.onclick = async () => {
            const query = prompt("Ask your AI Companion!");
            if (query) alert(await chatbotResponse(query));
        };
    }

    if (window.location.pathname.includes('lessons.html')) {
        const predefinedCourses = Array.from({ length: 100 }, (_, i) => {
            const categories = ['Math', 'Science', 'History', 'Programming', 'Language', 'Art'];
            const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
            const category = categories[i % categories.length];
            return {
                id: i + 1,
                title: `${category} Course ${i + 1}`,
                description: `Master ${category.toLowerCase()} with engaging lessons!`,
                progress: userData.progress[i + 1] || 0,
                difficulty: difficulties[Math.floor(i / 33) % 3],
                category
            };
        });

        function renderCourses(query = '', category = '') {
            const courseList = document.getElementById('course-list');
            const progressOverview = document.getElementById('progress-overview');
            if (!courseList) return;
            courseList.innerHTML = '';
            const filteredCourses = predefinedCourses.filter(c =>
                (c.title.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase())) &&
                (!category || c.category === category)
            );
            filteredCourses.forEach(course => {
                const card = document.createElement('div');
                card.className = 'lesson-card animate-slide-in';
                card.innerHTML = `
                    <h4 class="font-semibold"><i class="fas fa-book mr-2"></i>${course.title}</h4>
                    <p class="mt-2">${course.description}</p>
                    <p class="mt-2 text-gray-400">Difficulty: ${course.difficulty}</p>
                    <div class="course-progress mt-3"><div class="course-progress-bar" style="width: ${course.progress}%"></div></div>
                    <p class="mt-2">${course.progress}% Complete</p>
                    <button class="mt-4" onclick="window.location.href='lesson-detail.html?id=${course.id}'">
                        <i class="fas fa-play mr-2"></i>${course.progress === 100 ? 'Review' : 'Start'}
                    </button>
                `;
                courseList.appendChild(card);
            });
            if (progressOverview) {
                const completed = Object.values(userData.progress).filter(p => p === 100).length;
                progressOverview.textContent = `Completed ${completed} of ${predefinedCourses.length} courses!`;
            }
        }

        renderCourses();
        const searchInput = document.getElementById('course-search');
        const categoryFilter = document.getElementById('category-filter');
        if (searchInput) searchInput.oninput = debounce((e) => renderCourses(e.target.value, categoryFilter.value), 300);
        if (categoryFilter) categoryFilter.onchange = () => renderCourses(searchInput.value, categoryFilter.value);
    }

    if (window.location.pathname.includes('lesson-detail.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const lessonId = urlParams.get('id');
        loadLessonDetail(lessonId);
    }

    if (window.location.pathname.includes('forum.html')) {
        renderForumPosts();
        const postBtn = document.getElementById('post-btn');
        const textArea = document.getElementById('forum-text');
        const sortPosts = document.getElementById('sort-posts');
        if (postBtn && textArea) postBtn.onclick = async () => {
            const content = textArea.value.trim();
            if (content) {
                forumPosts.unshift({
                    user: userData.username,
                    content,
                    timestamp: new Date().toISOString().split('T')[0],
                    aiModerated: await moderatePost(content),
                    likes: 0
                });
                updateGamification(10, 'forum');
                textArea.value = '';
                renderForumPosts(sortPosts.value);
            }
        };
        if (sortPosts) sortPosts.onchange = () => renderForumPosts(sortPosts.value);
    }

    if (window.location.pathname.includes('games.html')) {
        loadQuiz();
        loadMemoryGame();
        loadWordScramble();
        const nextQuizBtn = document.getElementById('next-quiz');
        const resetMemoryBtn = document.getElementById('reset-memory');
        const nextScrambleBtn = document.getElementById('next-scramble');
        if (nextQuizBtn) nextQuizBtn.onclick = () => loadQuiz();
        if (resetMemoryBtn) resetMemoryBtn.onclick = () => loadMemoryGame();
        if (nextScrambleBtn) nextScrambleBtn.onclick = () => loadWordScramble();
    }

    if (window.location.pathname.includes('profile.html')) {
        updateProfile();
        const badgesDiv = document.getElementById('badges');
        if (badgesDiv) {
            userData.badges.forEach(badge => {
                const badgeDiv = document.createElement('div');
                badgeDiv.className = 'lesson-card animate-slide-in';
                badgeDiv.innerHTML = `<i class="fas fa-medal mr-2"></i>${badge}`;
                badgesDiv.appendChild(badgeDiv);
            });
        }
        const saveProfileBtn = document.getElementById('save-profile');
        if (saveProfileBtn) saveProfileBtn.onclick = () => {
            userData.username = document.getElementById('username-input').value || userData.username;
            const fileInput = document.getElementById('profile-image-input');
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    userData.profileImage = e.target.result;
                    localStorage.setItem('userData', JSON.stringify(userData));
                    updateProfile();
                };
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                localStorage.setItem('userData', JSON.stringify(userData));
                updateProfile();
            }
        };
    }
};
