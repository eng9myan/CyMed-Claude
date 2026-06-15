// Odoo 19 UI Interaction Logic
document.addEventListener('DOMContentLoaded', () => {
    // Add micro-animations and active states to kanban cards
    const cards = document.querySelectorAll('.kanban-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Simulate opening a record view like in Odoo
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        });
    });

    // Handle view toggles (Kanban vs List)
    const viewToggles = document.querySelectorAll('.view-toggles .icon-btn');
    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            viewToggles.forEach(btn => btn.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // In a real app, this would switch the view layout
        });
    });

    // Handle Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
});
