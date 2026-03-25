const Layout = {
    init() {
        this.currentStudent = this.loadStudent();
        this.renderSidebar();
        this.updateActiveNavLink();
        this.bindEvents();
        this.loadStats();
    },

    loadStudent() {
        const saved = sessionStorage.getItem('currentStudent');
        if (!saved) {
            // admin.html은 선생님 페이지 - 학생 없어도 리다이렉트 안 함
            const isAdmin = window.location.pathname.endsWith('admin.html');
            if (!isAdmin && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
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
        <div class="p-6">
            <header class="mb-8">
                <a href="index.html">
                    <h1 class="text-2xl font-black text-primary korean-text tracking-tight mb-2">개념 가챠</h1>
                </a>
                <p class="text-xs text-on-surface-variant korean-text font-medium leading-relaxed">
                    몰랐던 것을 기록하고,<br/>랜덤으로 꺼내서 기억하자
                </p>
            </header>

            <div class="mb-8 p-4 bg-primary-fixed/30 rounded-2xl border border-primary-fixed">
                <div class="text-[10px] text-primary font-bold uppercase mb-1 korean-text tracking-widest">현재 학생</div>
                <div class="flex items-center justify-between">
                    <span class="text-lg font-black text-on-surface korean-text" id="currentStudentName">${studentName}</span>
                    <button class="text-xs text-primary hover:underline korean-text font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" id="changeStudentBtn" aria-label="다른 학생으로 변경">변경</button>
                </div>
            </div>

            <nav class="space-y-1" aria-label="주요 메뉴">
                <a class="nav-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all korean-text border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="gacha.html">
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">style</span>
                    카드 뽑기
                </a>
                <a class="nav-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all korean-text border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="dashboard.html">
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">bar_chart</span>
                    학습 현황
                </a>
                <a class="nav-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all korean-text border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="add.html">
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">add_circle</span>
                    카드 추가
                </a>
                <a class="nav-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all korean-text border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="list.html">
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">grid_view</span>
                    전체 목록
                </a>
                <a class="nav-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all korean-text border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="admin.html">
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">settings</span>
                    관리자
                </a>
                <a class="nav-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all korean-text border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="print.html">
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">print</span>
                    인쇄 센터
                </a>
                <a class="nav-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all korean-text border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href="debug-generators.html">
                    <span class="material-symbols-outlined text-[20px]" aria-hidden="true">bug_report</span>
                    제네레이터 디버그
                </a>
            </nav>
        </div>
        <div class="p-6 border-t border-outline-variant/30">
            <h2 class="text-[10px] font-bold text-outline uppercase tracking-wider mb-4 korean-text">학습 현황</h2>
            <div class="grid grid-cols-2 gap-2">
                <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col">
                    <div class="text-[10px] text-on-surface-variant korean-text mb-1 font-bold uppercase">전체 카드</div>
                    <div class="text-2xl font-black text-on-surface" id="statTotal">0</div>
                </div>
                <div class="p-3 bg-error-container/30 rounded-xl border border-error/20 flex flex-col">
                    <div class="text-[10px] text-on-error-container korean-text mb-1 font-bold uppercase">상자 1</div>
                    <div class="text-2xl font-black text-error" id="statBox1">0</div>
                </div>
                <div class="p-3 bg-secondary-fixed/30 rounded-xl border border-secondary/20 flex flex-col">
                    <div class="text-[10px] text-on-surface-variant korean-text mb-1 font-bold uppercase">상자 2</div>
                    <div class="text-2xl font-black text-secondary" id="statBox2">0</div>
                </div>
                <div class="p-3 bg-tertiary-container/20 rounded-xl border border-tertiary/20 flex flex-col">
                    <div class="text-[10px] text-on-tertiary-container korean-text mb-1 font-bold uppercase">상자 3-4</div>
                    <div class="text-2xl font-black text-tertiary" id="statBox34">0</div>
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
                link.classList.add('bg-primary-fixed/40', 'text-primary', 'border-primary-fixed');
                link.classList.remove('text-on-surface-variant', 'border-transparent', 'hover:bg-surface-container-low');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('bg-primary-fixed/40', 'text-primary', 'border-primary-fixed');
                link.classList.add('text-on-surface-variant', 'border-transparent', 'hover:bg-surface-container-low');
                link.removeAttribute('aria-current');
            }
        });
    },

    bindEvents() {
        const changeBtn = document.getElementById('changeStudentBtn');
        if (changeBtn) {
            changeBtn.onclick = () => {
                sessionStorage.removeItem('currentStudent');
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
            toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-inverse-surface text-inverse-on-surface font-bold korean-text shadow-xl transition-all duration-300 z-[100] opacity-0';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
        if (isError) toast.classList.add('bg-error');
        else toast.classList.remove('bg-error');

        setTimeout(() => {
            toast.classList.remove('opacity-100');
            toast.classList.add('opacity-0');
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
