// Course Structure Definition
const courseStructure = [
    {
        title: "Overview",
        items: [
            { id: "syllabus", title: "Course Syllabus", file: "content/syllabus.md" },
            { id: "setup", title: "Installation & Setup", file: "content/setup.md" }
        ]
    },
    {
        title: "Modules",
        items: [
            { id: "lesson1", title: "Introduction to VEIN", file: "content/lesson1.md" },
            { id: "lesson2", title: "Traffic Modeling", file: "content/lesson2.md" },
            { id: "lesson3", title: "Emission Factors", file: "content/lesson3.md" },
            { id: "lesson4", title: "Spatial Allocation", file: "content/lesson4.md" }
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    // Basic Active link updating for navbar
    const navLinks = document.querySelectorAll(".nav-links a");
    const currentPath = window.location.pathname;
    
    // Only run course code if on the course page
    if (window.location.pathname.includes("course.html")) {
        initCourseViewer();
    }
});

function initCourseViewer() {
    // 1. Get requested page from URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentPageId = urlParams.get('page') || 'syllabus'; // Default to syllabus

    // 2. Build Sidebar
    const navMenu = document.getElementById("sidebar-nav");
    if (!navMenu) return;

    let selectedFile = null;

    courseStructure.forEach(group => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "sidebar-group";
        
        const groupTitle = document.createElement("h4");
        groupTitle.innerText = group.title;
        groupDiv.appendChild(groupTitle);
        
        const list = document.createElement("ul");
        list.className = "sidebar-list";
        
        group.items.forEach(item => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = `?page=${item.id}`;
            a.innerText = item.title;
            
            if (item.id === currentPageId) {
                a.className = "active";
                selectedFile = item.file;
                
                // Update doc title
                document.title = `${item.title} | VEIN Course`;
            }
            
            li.appendChild(a);
            list.appendChild(li);
        });
        
        groupDiv.appendChild(list);
        navMenu.appendChild(groupDiv);
    });

    // 3. Render Markdown Content
    const contentDiv = document.getElementById("content");
    
    // Configure marked to use highlight.js
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) {}
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });

    if (selectedFile) {
        fetch(selectedFile)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load content (${response.status})`);
                }
                return response.text();
            })
            .then(text => {
                contentDiv.innerHTML = marked.parse(text);
                
                // Additional formatting for tables
                const tables = contentDiv.querySelectorAll('table');
                tables.forEach(table => {
                    const wrapper = document.createElement('div');
                    wrapper.style.overflowX = 'auto';
                    table.parentNode.insertBefore(wrapper, table);
                    wrapper.appendChild(table);
                });
            })
            .catch(error => {
                contentDiv.innerHTML = `
                    <div style="background: rgba(255, 95, 86, 0.1); border: 1px solid #ff5f56; padding: 2rem; border-radius: 8px;">
                        <h2 style="color: #ff5f56; margin-top: 0;">Error Loading Content</h2>
                        <p>Could not load the requested practical content. Expected path: <code>${selectedFile}</code>.</p>
                        <p>Please create the content file or check your server configuration.</p>
                        <p style="font-size: 0.85em; color: var(--text-secondary);">${error.message}</p>
                    </div>
                `;
            });
    } else {
        contentDiv.innerHTML = `
            <h2>Page Not Found</h2>
            <p>The requested lesson could not be found.</p>
        `;
    }
}
