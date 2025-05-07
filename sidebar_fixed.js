// Sidebar Control Functions
const sidebarControl = {
    init() {
        this.sidebar = document.getElementById('mainSidebar');
        this.overlay = document.querySelector('.sidebar-overlay');
        this.toggleBtn = document.querySelector('.sidebar-toggle');
        this.logoutBtn = document.querySelector('.logout-item');

        if (!this.sidebar || !this.overlay || !this.toggleBtn) {
            console.error('Required sidebar elements not found');
            return;
        }

        this.addEventListeners();
    },

    addEventListeners() {
        // Toggle button click
        this.toggleBtn.addEventListener('click', () => this.toggleSidebar());

        // Overlay click
        this.overlay.addEventListener('click', () => this.closeSidebar());

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });

        // Handle logout
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Close sidebar on menu item click (mobile)
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.closeSidebar();
                }
            });
        });
    },

    toggleSidebar() {
        this.sidebar.classList.toggle('active');
        this.overlay.classList.toggle('active');
        document.body.style.overflow = this.sidebar.classList.contains('active') ? 'hidden' : '';
    },

    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    handleLogout() {
        // Add any cleanup or logout logic here
        window.location.href = 'index.html';
    }
};

// Initialize sidebar when document is ready
document.addEventListener('DOMContentLoaded', () => {
    sidebarControl.init();
});
