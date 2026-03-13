// Course Structure Definition
const courseStructure = [
    {
        title: "Visão Geral",
        items: [
            { id: "dataehora", title: "Curso", file: "content/dataehora.md" },
            { id: "syllabus", title: "Ementa", file: "content/syllabus.md" },
            { id: "setup", title: "Instalação", file: "content/setup.md" },
            { id: "intro", title: "Inventários", file: "content/intro.md" }
        ]
    },
    {
        title: "Conteúdo",
        items: [
            { 
                id: "lesson1", 
                title: "Introdução ao VEIN", 
                file: "content/lesson1.md",
            },
            { 
                id: "brazil_bu", 
                title: "brazil_bu", 
                file: "content/bu_00.md",
                subItems: [
                    { id: "brazil_bu_01", title: "main.R", file: "content/bu_01_main.md" },
                    { id: "brazil_bu_02", title: "config", file: "content/bu_02_config.md" },
                    { id: "brazil_bu_03", title: "net", file: "content/bu_03_net.md" },
                    { id: "brazil_bu_04", title: "traffic", file: "content/bu_04_traffic.md" },
                    { id: "brazil_bu_05", title: "fuel_eval", file: "content/bu_05.md" },
                    { id: "brazil_bu_06", title: "exhaust", file: "content/bu_06.md" },
                    { id: "brazil_bu_07", title: "evaporative", file: "content/bu_07.md" },
                    { id: "brazil_bu_08", title: "wear", file: "content/bu_08.md" },
                    { id: "brazil_bu_09", title: "post", file: "content/bu_09.md" },
                    { id: "brazil_bu_10", title: "plots", file: "content/bu_10.md" },
                    { id: "brazil_bu_11", title: "chemical mechanism", file: "content/bu_11.md" }
                ]
            },
            { 
                id: "lesson2", 
                title: "Modelagem de Tráfego", 
                file: "content/lesson2.md",
                subItems: [
                    { id: "lesson2-task1", title: "Configuração da Modelagem", file: "content/lesson2_task1.md" }
                ]
            },
            { id: "lesson3", title: "Fatores de Emissão", file: "content/lesson3.md" },
            { id: "lesson4", title: "Alocação Espacial", file: "content/lesson4.md" }
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
        
        const renderItems = (items, parentElement, isSublevel = false) => {
            const list = document.createElement("ul");
            list.className = isSublevel ? "sidebar-sublist" : "sidebar-list";
            
            items.forEach(item => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = `?page=${item.id}`;
                a.innerText = item.title;
                
                if (item.id === currentPageId) {
                    a.className = "active";
                    selectedFile = item.file;
                    
                    // Update doc title
                    document.title = `${item.title} | Curso VEIN`;
                }
                
                li.appendChild(a);
                list.appendChild(li);

                // Recursively render subItems if they exist
                if (item.subItems && item.subItems.length > 0) {
                    renderItems(item.subItems, li, true);
                }
            });
            
            parentElement.appendChild(list);
        };

        renderItems(group.items, groupDiv);
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
        langPrefix: 'hljs language-',
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
                
                // Apply syntax highlighting to the newly added code blocks
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
                
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
                        <h2 style="color: #ff5f56; margin-top: 0;">Erro ao Carregar o Conteúdo</h2>
                        <p>Não foi possível carregar o conteúdo prático solicitado. Caminho esperado: <code>${selectedFile}</code>.</p>
                        <p>Por favor, crie o arquivo de conteúdo ou verifique a configuração do seu servidor.</p>
                        <p style="font-size: 0.85em; color: var(--text-secondary);">${error.message}</p>
                    </div>
                `;
            });
    } else {
        contentDiv.innerHTML = `
            <h2>Página Não Encontrada</h2>
            <p>A lição solicitada não pôde ser encontrada.</p>
        `;
    }
}
