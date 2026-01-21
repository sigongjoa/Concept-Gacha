const Layout = {
    init() {
        this.currentStudent = this.loadStudent();
        this.renderSidebar();
        this.updateActiveNavLink();
        this.bindEvents();
        this.loadStats();
    },

    loadStudent() {
        const saved = localStorage.getItem('currentStudent');
        if (!saved) {
            // 학생이 없으면 선택 페이지로 이동 (이미 index.html이 아니면)
            if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
                window.location.href = 'index.html';
            }
            return null;
        }
        return JSON.parse(saved);
    },

    renderSidebar() {
        const sidebar = document.querySelector('aside');
        if (!sidebar) return;

        const studentName = this.currentStudent ? this.currentStudent.name : '-';

        sidebar.innerHTML = `
        <div class="p-8">
            <header class="mb-8">
                <a href="index.html">
                    <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 korean-text tracking-tight mb-2">개념 가챠</h1>
                </a>
                <p class="text-xs text-slate-500 dark:text-slate-400 korean-text font-medium leading-relaxed">
                    몰랐던 것을 기록하고,<br/>랜덤으로 꺼내서 기억하자
                </p>
            </header>

            <div class="mb-8 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                <div class="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase mb-1 korean-text">현재 학생</div>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-black text-slate-800 dark:text-white korean-text" id="currentStudentName">${studentName}</span>
                    <button class="text-xs text-orange-600 dark:text-orange-400 hover:underline korean-text font-bold" id="changeStudentBtn">변경</button>
                </div>
            </div>

            <nav class="space-y-4">
                <a class="nav-link flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all korean-text border" href="gacha.html">
                    <span class="material-symbols-outlined">style</span>
                    카드 뽑기
                </a>
                <a class="nav-link flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all korean-text border" href="add.html">
                    <span class="material-symbols-outlined">add_circle</span>
                    카드 추가
                </a>
                <a class="nav-link flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all korean-text border" href="list.html">
                    <span class="material-symbols-outlined">grid_view</span>
                    전체 목록
                </a>
            </nav>
        </div>
        <div class="p-8 border-t border-slate-100 dark:border-slate-800">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 korean-text">학습 현황</h3>
            <div class="grid grid-cols-2 gap-3">
                <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                    <div class="text-[10px] text-slate-500 korean-text mb-1 font-bold uppercase">전체 카드</div>
                    <div class="text-2xl font-black text-slate-800 dark:text-white" id="statTotal">0</div>
                </div>
                <div class="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 shadow-sm flex flex-col">
                    <div class="text-[10px] text-red-500 korean-text mb-1 font-bold uppercase">상자 1</div>
                    <div class="text-2xl font-black text-red-600 dark:text-red-400" id="statBox1">0</div>
                </div>
                <div class="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20 shadow-sm flex flex-col">
                    <div class="text-[10px] text-yellow-600 korean-text mb-1 font-bold uppercase">상자 2</div>
                    <div class="text-2xl font-black text-yellow-600 dark:text-yellow-400" id="statBox2">0</div>
                </div>
                <div class="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20 shadow-sm flex flex-col">
                    <div class="text-[10px] text-emerald-600 korean-text mb-1 font-bold uppercase">상자 3-4</div>
                    <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400" id="statBox34">0</div>
                </div>
            </div>
        </div>
        `;
    },

    updateActiveNavLink() {
        const path = window.location.pathname;
        const links = document.querySelectorAll('.nav-link');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (path.endsWith(href)) {
                link.classList.add('bg-gradient-to-r', 'from-orange-500/10', 'to-red-500/5', 'dark:from-orange-500/20', 'dark:to-red-500/10', 'text-orange-700', 'dark:text-orange-400', 'border-orange-100', 'dark:border-orange-500/20');
                link.classList.remove('text-slate-600', 'dark:text-slate-400', 'border-transparent', 'hover:bg-slate-50', 'dark:hover:bg-slate-800');
            } else {
                link.classList.remove('bg-gradient-to-r', 'from-orange-500/10', 'to-red-500/5', 'dark:from-orange-500/20', 'dark:to-red-500/10', 'text-orange-700', 'dark:text-orange-400', 'border-orange-100', 'dark:border-orange-500/20');
                link.classList.add('text-slate-600', 'dark:text-slate-400', 'border-transparent', 'hover:bg-slate-50', 'dark:hover:bg-slate-800');
            }
        });
    },

    bindEvents() {
        const changeBtn = document.getElementById('changeStudentBtn');
        if (changeBtn) {
            changeBtn.onclick = () => {
                localStorage.removeItem('currentStudent');
                window.location.href = 'index.html';
            };
        }

        // Mobile menu toggle (if needed)
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.querySelector('aside');
        if (mobileBtn && sidebar) {
            mobileBtn.onclick = () => {
                sidebar.classList.toggle('hidden');
            };
        }
    },

    async loadStats() {
        if (!this.currentStudent) return;
        try {
            const stats = await API.getStats(this.currentStudent.id);
            const updateField = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            };
            updateField('statTotal', stats.total);
            updateField('statBox1', stats.box1);
            updateField('statBox2', stats.box2);
            updateField('statBox34', (stats.box3 || 0) + (stats.box4 || 0));
        } catch (e) {
            console.error('Stats load failed:', e);
        }
    },

    showToast(msg, isError = false) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold korean-text shadow-xl transition-all duration-300 z-[100] opacity-0';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.className = toast.className.replace('opacity-0', 'opacity-100');
        if (isError) toast.classList.add('bg-red-500');
        else toast.classList.remove('bg-red-500');

        setTimeout(() => {
            toast.className = toast.className.replace('opacity-100', 'opacity-0');
        }, 2500);
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.Layout = Layout;
// Auto init after basic setup in pages
