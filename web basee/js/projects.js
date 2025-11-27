// Projects Page JavaScript

document.addEventListener("DOMContentLoaded", () => {
  const newProjectBtn = document.getElementById("newProjectBtn");
  const newProjectModal = document.getElementById("newProjectModal");
  const closeModal = document.getElementById("closeModal");
  const cancelProject = document.getElementById("cancelProject");
  const createProject = document.getElementById("createProject");
  const newProjectForm = document.getElementById("newProjectForm");
  const emptyProjectCard = document.getElementById("emptyProjectCard");
  const projectsGrid = document.getElementById("projectsGrid");
  const projectsList = document.getElementById("projectsList");
  const viewBtns = document.querySelectorAll(".view-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const openBtns = document.querySelectorAll(".btn-open");
  const aiToolCards = document.querySelectorAll(".ai-tool-card");

  // Video thumbnail hover play
  initializeVideoThumbnails();

  // AI Tool cards interaction
  aiToolCards.forEach(card => {
    // Skip if it's a link (clickable AI tool)
    if (card.tagName === 'A') return;
    
    card.addEventListener("click", () => {
      const tool = card.getAttribute("data-tool");
      const toolName = card.querySelector("h4").textContent;
      
      // Show a demo message about the AI tool
      const messages = {
        "ai-nimate": "AI-nimate: Animation Enhancement Tool\n\n• Frame Interpolation: Upgrade from 24/30fps to 60fps with one click\n• Super-Resolution: AI-powered upscaling for sharper visuals\n\nPerfect for creating smooth, high-quality animations.",
        "sync-voice": "SyncYourVoice: Automated Lip-Sync & Voice Matching\n\n• Natural lip movements synced to voice\n• Context-aware facial expressions\n• Auto-generated head movements reflecting emotion\n\nSeamlessly integrate voice with animation.",
        "proto-animate": "ProtoAnimate: AI-Driven Prototyping Tool\n\n• Rapid prototype generation from sketches\n• AI motion sequences from descriptions\n• Ethical content creation (based on your own works)\n\nJumpstart your animation projects with AI."
      };
      
      alert(messages[tool] || `${toolName} tool selected`);
    });
  });

  // Open new project modal
  function openNewProjectModal() {
    newProjectModal.classList.remove("hidden");
    document.getElementById("projectName").focus();
  }

  // Close new project modal
  function closeNewProjectModal() {
    newProjectModal.classList.add("hidden");
    newProjectForm.reset();
  }

  // Create new project
  function createNewProject() {
    const projectName = document.getElementById("projectName").value.trim();
    const template = document.getElementById("projectTemplate").value;

    if (!projectName) {
      alert("Please enter a project name");
      return;
    }

    // Simulate project creation
    const projectId = Date.now();
    const newProject = {
      id: projectId,
      name: projectName,
      template: template,
      lastModified: new Date().toLocaleString()
    };

    // Add project card to grid
    const projectCard = createProjectCard(newProject);
    projectsGrid.insertBefore(projectCard, emptyProjectCard);

    // Close modal and navigate to project
    closeNewProjectModal();
    navigateToProject(projectId, projectName);
  }

  // Create project card element
  function createProjectCard(project) {
    const card = document.createElement("div");
    card.className = "project-card";
    card.setAttribute("data-project-id", project.id);

    const icons = {
      "ai-nimate": "🎬",
      "sync-voice": "🎤",
      "proto-animate": "✨",
      "default": "🎨"
    };
    
    const icon = icons[project.template] || icons.default;

    card.innerHTML = `
      <div class="project-thumbnail">
        <div class="project-placeholder">${icon}</div>
      </div>
      <div class="project-info">
        <h3 class="project-name">${project.name}</h3>
        <p class="project-meta">Created: ${project.lastModified}</p>
        <div class="project-actions">
          <button class="btn-open" data-action="open">Open</button>
          <button class="btn-menu" data-action="menu">⋯</button>
        </div>
      </div>
    `;

    // Add event listeners
    const openBtn = card.querySelector(".btn-open");
    openBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navigateToProject(project.id, project.name);
    });

    card.addEventListener("click", (e) => {
      if (!e.target.closest(".project-actions")) {
        navigateToProject(project.id, project.name);
      }
    });

    return card;
  }

  // Navigate to project editor
  function navigateToProject(projectId, projectName, projectUrl) {
    // Store project info in sessionStorage
    sessionStorage.setItem("currentProjectId", projectId);
    sessionStorage.setItem("currentProjectName", projectName);
    
    // Navigate to project editor
    window.location.href = projectUrl || "project.html";
  }

  // View toggle (grid/list)
  viewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      
      viewBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (view === "list") {
        projectsGrid.classList.add("hidden");
        projectsList.classList.remove("hidden");
        // TODO: Populate list view
      } else {
        projectsGrid.classList.remove("hidden");
        projectsList.classList.add("hidden");
      }
    });
  });

  // Open project buttons
  openBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const projectCard = btn.closest(".project-card");
      const projectId = projectCard.getAttribute("data-project-id");
      const projectUrl = projectCard.getAttribute("data-project-url");
      const projectName = projectCard.querySelector(".project-name").textContent;
      navigateToProject(projectId, projectName, projectUrl);
    });
  });

  // Project card click handlers
  projectCards.forEach(card => {
    if (card.id !== "emptyProjectCard") {
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".project-actions")) {
          const projectId = card.getAttribute("data-project-id");
          const projectUrl = card.getAttribute("data-project-url");
          const projectName = card.querySelector(".project-name").textContent;
          navigateToProject(projectId, projectName, projectUrl);
        }
      });
    }
  });

  // Empty project card (create new)
  emptyProjectCard.addEventListener("click", openNewProjectModal);

  // Modal event listeners
  newProjectBtn.addEventListener("click", openNewProjectModal);
  closeModal.addEventListener("click", closeNewProjectModal);
  cancelProject.addEventListener("click", closeNewProjectModal);
  createProject.addEventListener("click", createNewProject);

  // Close modal on overlay click
  newProjectModal.addEventListener("click", (e) => {
    if (e.target === newProjectModal) {
      closeNewProjectModal();
    }
  });

  // Form submission
  newProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    createNewProject();
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Escape to close modal
    if (e.key === "Escape" && !newProjectModal.classList.contains("hidden")) {
      closeNewProjectModal();
    }
    // Ctrl/Cmd + N to create new project
    if ((e.ctrlKey || e.metaKey) && e.key === "n") {
      e.preventDefault();
      openNewProjectModal();
    }
  });
});

// Initialize video thumbnails to play on hover
function initializeVideoThumbnails() {
  const videoThumbs = document.querySelectorAll('.project-video-thumb');
  
  videoThumbs.forEach(video => {
    const card = video.closest('.project-card');
    
    if (card) {
      card.addEventListener('mouseenter', () => {
        video.play().catch(() => {
          // Autoplay may be blocked, that's okay
        });
      });
      
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
    }
  });
}