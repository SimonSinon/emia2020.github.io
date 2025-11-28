// Project Editor JavaScript

let openTabs = [];
let activeTabId = null;
let fileTreeData = {};
let activeFunctionId = null;

// Functions data - easily extensible for adding more functions
// To add a new function, simply add a new object to this array with the following properties:
// - id: unique identifier (lowercase, hyphens)
// - title: main function name
// - subtitle: secondary description
// - icon: emoji or icon character
// - description: detailed explanation of what the function does
// - accentColor: hex color code for the function's theme
const animationFunctions = [
  {
    id: "frame-interpolation",
    title: "AI-nimate",
    subtitle: "Smart In-Betweening & Frame Boosting",
    icon: "🎬",
    description: "Generate smooth intermediate frames between keyframes and boost frame rates (up to 120fps) for ultra-fluid animations.",
    accentColor: "#1f6feb"
  },
  {
    id: "sync-voice",
    title: "SyncYourVoice",
    subtitle: "Automated Lip-Sync & Voice Matching",
    icon: "🎤",
    description: "Automatically fuse voice and animation with natural lip-sync, context-aware facial expressions, and emotion-driven head movements.",
    accentColor: "#f85149"
  },
  {
    id: "proto-animate",
    title: "ProtoAnimate",
    subtitle: "AI-Driven Prototyping",
    icon: "✨",
    description: "Generate animation prototypes from sketches and descriptions. Create motion sequences and scene layouts with ethical, original AI content.",
    accentColor: "#a371f7"
  }
];

// Animation state
let currentFrame = 1;
let totalFrames = 60;
let fps = 24;
let isPlaying = false;
let selectedTool = null;
let zoomLevel = 100;

// Tools data
const drawingTools = [
  { id: "brush", icon: "🖌", title: "Brush Tool" },
  { id: "pencil", icon: "✏️", title: "Pencil Tool" },
  { id: "eraser", icon: "🧹", title: "Eraser Tool" },
  { id: "fill", icon: "🪣", title: "Fill Tool" },
  { id: "eyedropper", icon: "👁", title: "Eyedropper Tool" }
];

const riggingTools = [
  { id: "bone", icon: "🦴", title: "Bone Tool" },
  { id: "joint", icon: "🔗", title: "Joint Tool" },
  { id: "ik", icon: "🎯", title: "IK Chain Tool" },
  { id: "constraint", icon: "📐", title: "Constraint Tool" }
];

const transformTools = [
  { id: "select", icon: "↖", title: "Select Tool" },
  { id: "move", icon: "↔", title: "Move Tool" },
  { id: "rotate", icon: "⟲", title: "Rotate Tool" },
  { id: "scale", icon: "⇲", title: "Scale Tool" }
];

document.addEventListener("DOMContentLoaded", () => {
  // Initialize editor
  initializeEditor();
  setupEventListeners();
  loadProjectData();
  initializeFileTree();
  initializeFunctionsPanel();
  initializeToolsPanel();
  initializeTimeline();
  initializeLayers();
  initializePlaybackControls();
  initializeCanvas();
  initializeVideoPreview();
});

function initializeEditor() {
  // Get project info from sessionStorage
  const projectName = sessionStorage.getItem("currentProjectName") || "Untitled Animation Project";
  document.getElementById("projectTitle").textContent = projectName;
  
  // Update page title
  document.title = `${projectName} | Ai-mate Editor`;
  
  // Update user menu if logged in
  const userName = sessionStorage.getItem("userName") || "User";
  const userEmail = sessionStorage.getItem("userEmail") || "user@example.com";
  
  const userMenuName = document.getElementById("userMenuName");
  const userMenuEmail = document.getElementById("userMenuEmail");
  
  if (userMenuName) userMenuName.textContent = userName;
  if (userMenuEmail) userMenuEmail.textContent = userEmail;
}

function setupEventListeners() {
  // Back button
  document.getElementById("backBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to leave? Unsaved changes may be lost.")) {
      window.location.href = "projects.html";
    }
  });

  // AI Tools button
  document.getElementById("aiToolsBtn")?.addEventListener("click", () => {
    showAIToolsMenu();
  });

  // Upload button
  document.getElementById("uploadBtn").addEventListener("click", () => {
    openUploadModal();
  });

  // Download button
  document.getElementById("downloadBtn").addEventListener("click", () => {
    downloadProject();
  });

  // New file button
  document.getElementById("newFileBtn").addEventListener("click", () => {
    openNewItemModal("file");
  });

  // New folder button
  document.getElementById("newFolderBtn").addEventListener("click", () => {
    openNewItemModal("folder");
  });

  // File tree interactions
  setupFileTreeListeners();

  // Upload modal
  setupUploadModal();

  // New item modal
  setupNewItemModal();

  // Welcome page actions
  document.getElementById("welcomeNewFile")?.addEventListener("click", () => {
    openNewItemModal("file");
  });

  document.getElementById("welcomeUpload")?.addEventListener("click", () => {
    openUploadModal();
  });

  // Functions panel toggle (updated for new panel structure)
  const functionsToggleBtn = document.getElementById("functionsToggleBtn");
  if (functionsToggleBtn) {
    functionsToggleBtn.addEventListener("click", () => {
      toggleFunctionsPanel();
    });
  }

  // Setup panel toggles
  setupPanelToggles();
  
  // User menu
  setupUserMenu();
}

function loadProjectData() {
  // Load project data (in real app, this would fetch from server)
  const projectId = sessionStorage.getItem("currentProjectId");
  if (projectId) {
    // Simulate loading project files
    console.log("Loading project:", projectId);
  }
}

function initializeFileTree() {
  // File tree is already in HTML, just need to set up interactions
  const treeItems = document.querySelectorAll(".tree-item");
  
  treeItems.forEach(item => {
    const content = item.querySelector(".tree-item-content");
    if (content) {
      content.addEventListener("click", (e) => {
        e.stopPropagation();
        
        if (item.classList.contains("folder")) {
          // Toggle folder
          item.classList.toggle("expanded");
        } else {
          // Open file
          const filePath = item.getAttribute("data-path");
          openFile(filePath);
        }
      });
    }
  });
}

function setupFileTreeListeners() {
  // Context menu (right-click) could be added here
  const treeItems = document.querySelectorAll(".tree-item");
  
  treeItems.forEach(item => {
    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      // Context menu implementation would go here
    });
  });
}

function openFile(filePath) {
  // Check if file is already open
  const existingTab = openTabs.find(tab => tab.path === filePath);
  
  if (existingTab) {
    // Switch to existing tab
    switchToTab(existingTab.id);
    return;
  }

  // Create new tab
  const tabId = `tab-${Date.now()}`;
  const fileName = filePath.split("/").pop();
  const fileExtension = fileName.split(".").pop() || "";

  const tab = {
    id: tabId,
    path: filePath,
    name: fileName,
    type: getFileType(fileExtension)
  };

  openTabs.push(tab);
  activeTabId = tabId;

  // Create tab element
  createTabElement(tab);
  
  // Create editor view
  createEditorView(tab);

  // Update UI
  updateTabsBar();
  showEditorContent(tabId);
  
  // Update file tree selection
  updateFileTreeSelection(filePath);
}

function getFileType(extension) {
  const codeTypes = ["js", "json", "css", "html", "xml", "txt"];
  const imageTypes = ["png", "jpg", "jpeg", "gif", "svg", "webp"];
  const animTypes = ["anim", "anm"];

  if (animTypes.includes(extension)) return "animation";
  if (codeTypes.includes(extension)) return "code";
  if (imageTypes.includes(extension)) return "image";
  return "other";
}

function createTabElement(tab) {
  const tabsContainer = document.getElementById("tabsContainer");
  const tabElement = document.createElement("div");
  tabElement.className = "tab";
  tabElement.id = tab.id;
  tabElement.setAttribute("data-tab-id", tab.id);

  tabElement.innerHTML = `
    <span class="tab-name">${tab.name}</span>
    <button class="tab-close" data-tab-id="${tab.id}">&times;</button>
  `;

  // Tab click handler
  tabElement.addEventListener("click", (e) => {
    if (!e.target.classList.contains("tab-close")) {
      switchToTab(tab.id);
    }
  });

  // Close button handler
  const closeBtn = tabElement.querySelector(".tab-close");
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeTab(tab.id);
  });

  tabsContainer.appendChild(tabElement);
}

function createEditorView(tab) {
  const editorContent = document.getElementById("editorContent");
  
  // Hide welcome screen
  const welcome = editorContent.querySelector(".editor-welcome");
  if (welcome) {
    welcome.classList.add("hidden");
  }

  // Create editor view
  const editorView = document.createElement("div");
  editorView.className = "file-editor hidden";
  editorView.id = `editor-${tab.id}`;

  let content = "";
  if (tab.type === "code" || tab.type === "animation") {
    content = getDefaultFileContent(tab.path, tab.type);
  }

  editorView.innerHTML = `
    <div class="file-editor-header">
      <h3>${tab.name}</h3>
    </div>
    <div class="file-editor-content">
      <textarea id="content-${tab.id}" placeholder="Start editing...">${content}</textarea>
    </div>
  `;

  editorContent.appendChild(editorView);

  // Add change listener
  const textarea = editorView.querySelector(`#content-${tab.id}`);
  if (textarea) {
    textarea.addEventListener("input", () => {
      markTabAsModified(tab.id);
    });
  }
}

function getDefaultFileContent(filePath, type) {
  if (type === "animation") {
    return `{
  "name": "Animation",
  "duration": 1000,
  "frames": [],
  "properties": {
    "width": 800,
    "height": 600
  }
}`;
  } else if (type === "code") {
    return `// ${filePath.split("/").pop()}\n// Start coding here...`;
  }
  return "";
}

function switchToTab(tabId) {
  activeTabId = tabId;
  updateTabsBar();
  showEditorContent(tabId);
  
  const tab = openTabs.find(t => t.id === tabId);
  if (tab) {
    updateFileTreeSelection(tab.path);
  }
}

function closeTab(tabId) {
  const tabIndex = openTabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;

  // Remove tab from array
  openTabs.splice(tabIndex, 1);

  // Remove tab element
  const tabElement = document.getElementById(tabId);
  if (tabElement) {
    tabElement.remove();
  }

  // Remove editor view
  const editorView = document.getElementById(`editor-${tabId}`);
  if (editorView) {
    editorView.remove();
  }

  // Switch to another tab or show welcome
  if (openTabs.length > 0) {
    const newActiveTab = openTabs[openTabs.length - 1];
    switchToTab(newActiveTab.id);
  } else {
    showWelcomeScreen();
  }

  updateTabsBar();
}

function updateTabsBar() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    const tabId = tab.getAttribute("data-tab-id");
    if (tabId === activeTabId) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
}

function showEditorContent(tabId) {
  // Hide all editors
  const editors = document.querySelectorAll(".file-editor");
  editors.forEach(editor => {
    editor.classList.add("hidden");
  });

  // Show active editor
  const activeEditor = document.getElementById(`editor-${tabId}`);
  if (activeEditor) {
    activeEditor.classList.remove("hidden");
  }

  // Hide welcome screen
  const welcome = document.querySelector(".editor-welcome");
  if (welcome) {
    welcome.classList.add("hidden");
  }
}

function showWelcomeScreen() {
  const welcome = document.querySelector(".editor-welcome");
  if (welcome) {
    welcome.classList.remove("hidden");
  }

  // Hide all editors
  const editors = document.querySelectorAll(".file-editor");
  editors.forEach(editor => {
    editor.classList.add("hidden");
  });
}

function updateFileTreeSelection(filePath) {
  // Remove previous selection
  document.querySelectorAll(".tree-item.file.selected").forEach(item => {
    item.classList.remove("selected");
  });

  // Add selection to current file
  const fileItem = document.querySelector(`.tree-item.file[data-path="${filePath}"]`);
  if (fileItem) {
    fileItem.classList.add("selected");
    
    // Expand parent folders
    let parent = fileItem.parentElement;
    while (parent && parent.classList.contains("tree-children")) {
      const folder = parent.previousElementSibling;
      if (folder && folder.classList.contains("tree-item") && folder.classList.contains("folder")) {
        folder.classList.add("expanded");
      }
      parent = parent.parentElement;
    }
  }
}

function markTabAsModified(tabId) {
  const tab = openTabs.find(t => t.id === tabId);
  if (tab && !tab.modified) {
    tab.modified = true;
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      const tabName = tabElement.querySelector(".tab-name");
      if (tabName && !tabName.textContent.includes("*")) {
        tabName.textContent = tab.name + " *";
      }
    }
  }
}

// Upload Modal Functions
function setupUploadModal() {
  const uploadModal = document.getElementById("uploadModal");
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const folderInput = document.getElementById("folderInput");
  const browseFiles = document.getElementById("browseFiles");
  const closeUploadModal = document.getElementById("closeUploadModal");
  const cancelUpload = document.getElementById("cancelUpload");
  const confirmUpload = document.getElementById("confirmUpload");

  // Open upload modal
  function openUploadModal() {
    uploadModal.classList.remove("hidden");
  }

  // Close upload modal
  function closeUploadModalFunc() {
    uploadModal.classList.add("hidden");
    uploadArea.classList.remove("drag-over");
    document.getElementById("uploadList").classList.add("hidden");
    document.getElementById("uploadFilesList").innerHTML = "";
  }

  // Drag and drop
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    
    const files = Array.from(e.dataTransfer.files);
    handleFilesSelected(files);
  });

  // Browse files
  browseFiles.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    handleFilesSelected(files);
  });

  // Handle selected files
  function handleFilesSelected(files) {
    const uploadList = document.getElementById("uploadList");
    const uploadFilesList = document.getElementById("uploadFilesList");
    
    uploadFilesList.innerHTML = "";
    
    files.forEach(file => {
      const li = document.createElement("li");
      li.textContent = `${file.name} (${formatFileSize(file.size)})`;
      uploadFilesList.appendChild(li);
    });

    uploadList.classList.remove("hidden");
  }

  // Confirm upload
  confirmUpload.addEventListener("click", () => {
    const files = fileInput.files;
    if (files.length > 0) {
      // Simulate upload
      alert(`Uploading ${files.length} file(s)...\n\n(In a real app, files would be uploaded to the server)`);
      closeUploadModalFunc();
      // TODO: Refresh file tree after upload
    } else {
      alert("Please select files to upload");
    }
  });

  // Close handlers
  closeUploadModal.addEventListener("click", closeUploadModalFunc);
  cancelUpload.addEventListener("click", closeUploadModalFunc);
  uploadModal.addEventListener("click", (e) => {
    if (e.target === uploadModal) {
      closeUploadModalFunc();
    }
  });

  // Make openUploadModal available globally
  window.openUploadModal = openUploadModal;
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

// New Item Modal Functions
function setupNewItemModal() {
  const newItemModal = document.getElementById("newItemModal");
  const newItemForm = document.getElementById("newItemForm");
  const newItemName = document.getElementById("newItemName");
  const closeNewItemModal = document.getElementById("closeNewItemModal");
  const cancelNewItem = document.getElementById("cancelNewItem");
  const createNewItem = document.getElementById("createNewItem");
  let currentItemType = "file";

  function openNewItemModal(type) {
    currentItemType = type;
    const title = document.getElementById("newItemTitle");
    const label = document.getElementById("newItemLabel");
    
    if (type === "file") {
      title.textContent = "Create New File";
      label.textContent = "File Name";
      newItemName.placeholder = "Enter file name (e.g., script.js, animation.anim)";
    } else {
      title.textContent = "Create New Folder";
      label.textContent = "Folder Name";
      newItemName.placeholder = "Enter folder name";
    }
    
    newItemModal.classList.remove("hidden");
    newItemName.value = "";
    newItemName.focus();
  }

  function closeNewItemModalFunc() {
    newItemModal.classList.add("hidden");
    newItemForm.reset();
  }

  createNewItem.addEventListener("click", () => {
    const name = newItemName.value.trim();
    if (!name) {
      alert("Please enter a name");
      return;
    }

    if (currentItemType === "file" && !name.includes(".")) {
      if (!confirm("File name doesn't have an extension. Create anyway?")) {
        return;
      }
    }

    // Simulate file/folder creation
    alert(`Created new ${currentItemType}: ${name}\n\n(In a real app, this would create the file/folder in the project)`);
    closeNewItemModalFunc();
    // TODO: Refresh file tree
  });

  closeNewItemModal.addEventListener("click", closeNewItemModalFunc);
  cancelNewItem.addEventListener("click", closeNewItemModalFunc);
  newItemModal.addEventListener("click", (e) => {
    if (e.target === newItemModal) {
      closeNewItemModalFunc();
    }
  });

  newItemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    createNewItem.click();
  });

  // Make openNewItemModal available globally
  window.openNewItemModal = openNewItemModal;
}

// Download Project
function downloadProject() {
  const projectName = document.getElementById("projectTitle").textContent;
  alert(`Downloading project: ${projectName}\n\n(In a real app, this would download all project files as a zip)`);
}

// AI Tools Menu
function showAIToolsMenu() {
  const modal = document.getElementById("aiToolsModal");
  if (modal) {
    modal.classList.remove("hidden");
    
    // Add close handlers
    const closeBtn = document.getElementById("closeAIToolsModal");
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.add("hidden");
    }
    
    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
      }
    };
    
    // Add hover effect to active tool card
    const toolCards = modal.querySelectorAll('.ai-tool-card');
    toolCards.forEach(card => {
      if (!card.style.opacity || card.style.opacity === '1') {
        card.onmouseenter = () => {
          card.style.transform = 'translateX(4px)';
          card.style.boxShadow = '0 4px 12px rgba(217, 119, 86, 0.15)';
        };
        card.onmouseleave = () => {
          card.style.transform = '';
          card.style.boxShadow = '';
        };
      }
    });
  }
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    if (activeTabId) {
      const tab = openTabs.find(t => t.id === activeTabId);
      if (tab) {
        alert(`Saving ${tab.name}...\n\n(In a real app, this would save the file)`);
        tab.modified = false;
        const tabElement = document.getElementById(tab.id);
        if (tabElement) {
          const tabName = tabElement.querySelector(".tab-name");
          if (tabName) {
            tabName.textContent = tab.name;
          }
        }
      }
    }
  }

  // Ctrl/Cmd + W to close tab
  if ((e.ctrlKey || e.metaKey) && e.key === "w") {
    e.preventDefault();
    if (activeTabId) {
      closeTab(activeTabId);
    }
  }

  // Escape to close modals
  if (e.key === "Escape") {
    const uploadModal = document.getElementById("uploadModal");
    const newItemModal = document.getElementById("newItemModal");
    const functionsPanel = document.getElementById("functionsPanel");
    
    if (!uploadModal.classList.contains("hidden")) {
      uploadModal.classList.add("hidden");
    }
    if (!newItemModal.classList.contains("hidden")) {
      newItemModal.classList.add("hidden");
    }
    if (functionsPanel && !functionsPanel.classList.contains("hidden")) {
      hideFunctionsPanel();
    }
  }
});

// Functions Panel Functions
function initializeFunctionsPanel() {
  const functionsList = document.getElementById("functionsList");
  if (!functionsList) return;

  // Clear existing functions
  functionsList.innerHTML = "";

  // Render each function card
  animationFunctions.forEach(func => {
    const functionCard = createFunctionCard(func);
    functionsList.appendChild(functionCard);
  });
}

function createFunctionCard(func) {
  const card = document.createElement("div");
  card.className = "function-card";
  card.setAttribute("data-function", func.id);
  card.setAttribute("data-function-id", func.id);

  card.innerHTML = `
    <div class="function-header">
      <div class="function-icon">${func.icon}</div>
      <div class="function-title-group">
        <h4 class="function-title">${func.title}</h4>
        <p class="function-subtitle">${func.subtitle}</p>
      </div>
    </div>
    <p class="function-description">${func.description}</p>
  `;

  // Add click handler
  card.addEventListener("click", () => {
    selectFunction(func.id);
  });

  return card;
}

function selectFunction(functionId) {
  // Remove active class from all function cards
  document.querySelectorAll(".function-card").forEach(card => {
    card.classList.remove("active");
  });

  // Add active class to selected function
  const selectedCard = document.querySelector(`[data-function-id="${functionId}"]`);
  if (selectedCard) {
    selectedCard.classList.add("active");
    activeFunctionId = functionId;
    
    // Show a placeholder message (since we're only doing UI, not actual functionality)
    const func = animationFunctions.find(f => f.id === functionId);
    if (func) {
      console.log(`Function selected: ${func.title} - ${func.subtitle}`);
      // In a real app, this would trigger the actual function UI/panel
      showFunctionPlaceholder(func);
    }
  }
}

function showFunctionPlaceholder(func) {
  // This is just a UI placeholder - in a real app, this would open the function's interface
  // For now, we'll just log and show a simple alert to demonstrate the interaction
  // You could replace this with opening a modal or panel for the specific function
  const message = `Selected: ${func.title}\n\n${func.description}\n\n(In a real app, this would open the ${func.title} interface)`;
  // Uncomment the line below if you want to show an alert on selection
  // alert(message);
}

function toggleFunctionsPanel() {
  const functionsPanel = document.getElementById("functionsPanel");
  if (!functionsPanel) return;

  if (functionsPanel.classList.contains("hidden")) {
    functionsPanel.classList.remove("hidden");
  } else {
    functionsPanel.classList.add("hidden");
  }
}

// Tools Panel Functions
function initializeToolsPanel() {
  const drawingToolsContainer = document.getElementById("drawingTools");
  const riggingToolsContainer = document.getElementById("riggingTools");
  const transformToolsContainer = document.getElementById("transformTools");

  if (drawingToolsContainer) {
    drawingTools.forEach(tool => {
      const toolBtn = createToolButton(tool);
      drawingToolsContainer.appendChild(toolBtn);
    });
  }

  if (riggingToolsContainer) {
    riggingTools.forEach(tool => {
      const toolBtn = createToolButton(tool);
      riggingToolsContainer.appendChild(toolBtn);
    });
  }

  if (transformToolsContainer) {
    transformTools.forEach(tool => {
      const toolBtn = createToolButton(tool);
      transformToolsContainer.appendChild(toolBtn);
    });
  }

  // Default to select tool
  selectTool("select");
}

function createToolButton(tool) {
  const btn = document.createElement("button");
  btn.className = "tool-btn";
  btn.setAttribute("data-tool-id", tool.id);
  btn.setAttribute("title", tool.title);
  btn.textContent = tool.icon;

  btn.addEventListener("click", () => {
    selectTool(tool.id);
  });

  return btn;
}

function selectTool(toolId) {
  // Remove active class from all tools
  document.querySelectorAll(".tool-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  // Add active class to selected tool
  const selectedBtn = document.querySelector(`[data-tool-id="${toolId}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add("active");
    selectedTool = toolId;
    console.log(`Tool selected: ${toolId}`);
    
    // Hide placeholder when tool is selected
    const placeholder = document.querySelector(".canvas-placeholder");
    if (placeholder) {
      placeholder.style.opacity = "0.3";
    }
  }
}

// Timeline Functions
function initializeTimeline() {
  const timelineFrames = document.getElementById("timelineFrames");
  if (!timelineFrames) return;

  // Create frame markers
  for (let i = 0; i <= totalFrames; i++) {
    const marker = document.createElement("div");
    marker.className = "frame-marker";
    
    // Major markers every 5 frames
    if (i % 5 === 0) {
      marker.classList.add("major");
      marker.textContent = i;
    } else {
      marker.classList.add("minor");
    }

    marker.style.left = `${(i / totalFrames) * 100}%`;
    timelineFrames.appendChild(marker);
  }

  updatePlayhead();
}

function updatePlayhead() {
  const playhead = document.getElementById("timelinePlayhead");
  if (playhead) {
    const percentage = ((currentFrame - 1) / (totalFrames - 1)) * 100;
    playhead.style.left = `${percentage}%`;
  }

  // Update frame display
  const currentFrameEl = document.getElementById("currentFrame");
  if (currentFrameEl) {
    currentFrameEl.textContent = currentFrame;
  }
}

// Layers Functions
function initializeLayers() {
  const layersList = document.getElementById("layersList");
  if (!layersList) return;

  // Add default layers
  addLayer("Background", "🎨", true);
  addLayer("Character", "👤", true);
  addLayer("Foreground", "🌿", false);
}

function addLayer(name, icon = "📄", visible = true) {
  const layersList = document.getElementById("layersList");
  if (!layersList) return;

  const layerItem = document.createElement("div");
  layerItem.className = "layer-item";
  layerItem.setAttribute("data-layer-name", name);

  layerItem.innerHTML = `
    <span class="layer-visibility">${visible ? "👁" : "🚫"}</span>
    <span class="layer-lock">🔓</span>
    <span class="layer-icon">${icon}</span>
    <span class="layer-name">${name}</span>
  `;

  // Layer click handler
  layerItem.addEventListener("click", (e) => {
    if (!e.target.classList.contains("layer-visibility") && 
        !e.target.classList.contains("layer-lock")) {
      selectLayer(name);
    }
  });

  // Visibility toggle
  const visibilityBtn = layerItem.querySelector(".layer-visibility");
  visibilityBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = visibilityBtn.textContent === "👁";
    visibilityBtn.textContent = isVisible ? "🚫" : "👁";
  });

  // Lock toggle
  const lockBtn = layerItem.querySelector(".layer-lock");
  lockBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    lockBtn.classList.toggle("locked");
    lockBtn.textContent = lockBtn.classList.contains("locked") ? "🔒" : "🔓";
  });

  layersList.appendChild(layerItem);
}

function selectLayer(layerName) {
  // Remove active class from all layers
  document.querySelectorAll(".layer-item").forEach(item => {
    item.classList.remove("active");
  });

  // Add active class to selected layer
  const selectedLayer = document.querySelector(`[data-layer-name="${layerName}"]`);
  if (selectedLayer) {
    selectedLayer.classList.add("active");
  }
}

// Playback Controls Functions
function initializePlaybackControls() {
  const playPauseBtn = document.getElementById("playPauseBtn");
  const firstFrameBtn = document.getElementById("firstFrameBtn");
  const prevFrameBtn = document.getElementById("prevFrameBtn");
  const nextFrameBtn = document.getElementById("nextFrameBtn");
  const lastFrameBtn = document.getElementById("lastFrameBtn");
  const loopToggleBtn = document.getElementById("loopToggleBtn");

  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", togglePlayPause);
  }

  if (firstFrameBtn) {
    firstFrameBtn.addEventListener("click", () => goToFrame(1));
  }

  if (prevFrameBtn) {
    prevFrameBtn.addEventListener("click", () => goToFrame(Math.max(1, currentFrame - 1)));
  }

  if (nextFrameBtn) {
    nextFrameBtn.addEventListener("click", () => goToFrame(Math.min(totalFrames, currentFrame + 1)));
  }

  if (lastFrameBtn) {
    lastFrameBtn.addEventListener("click", () => goToFrame(totalFrames));
  }

  if (loopToggleBtn) {
    loopToggleBtn.addEventListener("click", () => {
      loopToggleBtn.classList.toggle("active");
    });
  }
}

function togglePlayPause() {
  isPlaying = !isPlaying;
  const playPauseIcon = document.getElementById("playPauseIcon");
  const playPauseLabel = document.getElementById("playPauseLabel");
  
  if (playPauseIcon) {
    playPauseIcon.textContent = isPlaying ? "⏸" : "▶";
  }
  if (playPauseLabel) {
    playPauseLabel.textContent = isPlaying ? "Pause" : "Play";
  }

  if (isPlaying) {
    startAnimation();
  } else {
    stopAnimation();
  }
}

function startAnimation() {
  // Animation loop (UI only - no actual animation)
  if (!isPlaying) return;
  
  setTimeout(() => {
    if (isPlaying) {
      if (currentFrame < totalFrames) {
        goToFrame(currentFrame + 1);
      } else {
        const loopBtn = document.getElementById("loopToggleBtn");
        if (loopBtn && loopBtn.classList.contains("active")) {
          goToFrame(1);
        } else {
          togglePlayPause();
        }
      }
      startAnimation();
    }
  }, 1000 / fps);
}

function stopAnimation() {
  isPlaying = false;
}

function goToFrame(frame) {
  currentFrame = Math.max(1, Math.min(totalFrames, frame));
  updatePlayhead();
}

// Canvas Functions
function initializeCanvas() {
  const canvas = document.getElementById("animationCanvas");
  const grid = document.getElementById("canvasGrid");
  const gridToggleBtn = document.getElementById("gridToggleBtn");

  if (!canvas) return;

  // Set canvas size (scaled for display)
  updateCanvasZoom();

  // Grid toggle
  if (gridToggleBtn && grid) {
    gridToggleBtn.addEventListener("click", () => {
      grid.classList.toggle("visible");
      gridToggleBtn.classList.toggle("active");
    });
  }

  // Zoom controls
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const fitToScreenBtn = document.getElementById("fitToScreenBtn");

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      zoomLevel = Math.min(500, zoomLevel + 25);
      updateCanvasZoom();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      zoomLevel = Math.max(25, zoomLevel - 25);
      updateCanvasZoom();
    });
  }

  if (fitToScreenBtn) {
    fitToScreenBtn.addEventListener("click", () => {
      zoomLevel = 100;
      updateCanvasZoom();
    });
  }

  // Canvas placeholder interaction
  const placeholder = document.querySelector(".canvas-placeholder");
  if (placeholder && canvas) {
    canvas.addEventListener("click", () => {
      if (selectedTool) {
        placeholder.style.display = "none";
      }
    });
  }

  // Ruler toggle
  const rulerToggleBtn = document.getElementById("rulerToggleBtn");
  if (rulerToggleBtn) {
    rulerToggleBtn.addEventListener("click", () => {
      const rulers = document.getElementById("viewportRulers");
      if (rulers) {
        rulers.classList.toggle("hidden");
        rulerToggleBtn.classList.toggle("active");
      }
    });
  }

  // Onion skin toggle
  const onionSkinToggleBtn = document.getElementById("onionSkinToggleBtn");
  if (onionSkinToggleBtn) {
    onionSkinToggleBtn.addEventListener("click", () => {
      onionSkinToggleBtn.classList.toggle("active");
      console.log("Onion skin toggled");
    });
  }
}

function updateCanvasZoom() {
  const canvas = document.getElementById("animationCanvas");
  const zoomLevelEl = document.getElementById("zoomLevel");
  
  if (canvas) {
    const scale = zoomLevel / 100;
    canvas.style.transform = `scale(${scale})`;
    canvas.style.transformOrigin = "center center";
  }

  if (zoomLevelEl) {
    zoomLevelEl.textContent = `${zoomLevel}%`;
  }
}

// Panel Toggle Functions
function setupPanelToggles() {
  // Tools panel toggle
  const toolsToggleBtn = document.getElementById("toolsToggleBtn");
  const toggleToolsPanelBtn = document.getElementById("toggleToolsPanel");
  const toolsPanel = document.getElementById("toolsPanel");

  if (toolsToggleBtn) {
    toolsToggleBtn.addEventListener("click", () => {
      if (toolsPanel) {
        toolsPanel.classList.toggle("collapsed");
      }
    });
  }

  if (toggleToolsPanelBtn) {
    toggleToolsPanelBtn.addEventListener("click", () => {
      if (toolsPanel) {
        toolsPanel.classList.toggle("collapsed");
      }
    });
  }

  // Timeline collapse
  const timelineCollapseBtn = document.getElementById("timelineCollapseBtn");
  const timelineContainer = document.getElementById("timelineContainer");

  if (timelineCollapseBtn && timelineContainer) {
    timelineCollapseBtn.addEventListener("click", () => {
      timelineContainer.classList.toggle("collapsed");
      timelineCollapseBtn.querySelector("span").textContent = 
        timelineContainer.classList.contains("collapsed") ? "▶" : "▼";
    });
  }

  // Layers panel collapse
  const toggleLayersPanelBtn = document.getElementById("toggleLayersPanel");
  const layersPanel = document.getElementById("layersPanel");

  if (toggleLayersPanelBtn && layersPanel) {
    toggleLayersPanelBtn.addEventListener("click", () => {
      layersPanel.classList.toggle("collapsed");
      toggleLayersPanelBtn.querySelector("span").textContent = 
        layersPanel.classList.contains("collapsed") ? "▶" : "▼";
    });
  }

  // Properties panel collapse
  const togglePropertiesPanelBtn = document.getElementById("togglePropertiesPanel");
  const propertiesPanel = document.getElementById("propertiesPanel");

  if (togglePropertiesPanelBtn && propertiesPanel) {
    togglePropertiesPanelBtn.addEventListener("click", () => {
      propertiesPanel.classList.toggle("collapsed");
      togglePropertiesPanelBtn.querySelector("span").textContent = 
        propertiesPanel.classList.contains("collapsed") ? "▶" : "▼";
    });
  }

  // Functions panel toggle button in panel header
  const toggleFunctionsPanelBtn = document.getElementById("toggleFunctionsPanel");
  if (toggleFunctionsPanelBtn) {
    toggleFunctionsPanelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFunctionsPanel();
    });
  }

  // Add layer buttons
  const addLayerBtn = document.getElementById("addLayerBtn");
  const addLayerSidebarBtn = document.getElementById("addLayerSidebarBtn");

  const addLayerHandler = () => {
    const name = prompt("Enter layer name:");
    if (name) {
      addLayer(name);
    }
  };

  if (addLayerBtn) {
    addLayerBtn.addEventListener("click", addLayerHandler);
  }

  if (addLayerSidebarBtn) {
    addLayerSidebarBtn.addEventListener("click", addLayerHandler);
  }
}

// User Menu Functions
function setupUserMenu() {
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userMenuDropdown = document.getElementById("userMenuDropdown");
  const logoutFromEditor = document.getElementById("logoutFromEditor");
  const backToDashboard = document.getElementById("backToDashboard");
  const accountSettings = document.getElementById("accountSettings");
  
  if (userMenuBtn && userMenuDropdown) {
    // Toggle menu
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenuDropdown.classList.toggle("hidden");
    });
    
    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!userMenuDropdown.contains(e.target) && e.target !== userMenuBtn) {
        userMenuDropdown.classList.add("hidden");
      }
    });
  }
  
  // Logout handler
  if (logoutFromEditor) {
    logoutFromEditor.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout? Unsaved changes may be lost.")) {
        if (window.authFunctions && window.authFunctions.handleLogout) {
          window.authFunctions.handleLogout();
        }
      }
    });
  }
  
  // Back to dashboard
  if (backToDashboard) {
    backToDashboard.addEventListener("click", () => {
      if (confirm("Are you sure you want to leave? Unsaved changes may be lost.")) {
        window.location.href = "projects.html";
      }
    });
  }
  
  // Account settings (placeholder)
  if (accountSettings) {
    accountSettings.addEventListener("click", () => {
      alert("Account Settings\n\nThis feature would open account settings in a production app.");
    });
  }
}

// ====================================
// Resizable Panels System
// ====================================

function initializeResizablePanels() {
  // File Explorer (left sidebar) - horizontal resize
  setupHorizontalResize({
    panel: document.querySelector('.file-explorer'),
    handle: 'right',
    minWidth: 150,
    maxWidth: 450
  });

  // Tools Panel - horizontal resize
  setupHorizontalResize({
    panel: document.querySelector('.tools-panel'),
    handle: 'right',
    minWidth: 60,
    maxWidth: 350
  });

  // Right Sidebar - horizontal resize (from left edge)
  setupHorizontalResize({
    panel: document.querySelector('.right-sidebar'),
    handle: 'left',
    minWidth: 200,
    maxWidth: 500
  });

  // Timeline Layers - horizontal resize
  setupHorizontalResize({
    panel: document.querySelector('.timeline-layers'),
    handle: 'right',
    minWidth: 100,
    maxWidth: 350
  });

  // Timeline Container - vertical resize
  setupVerticalResize({
    panel: document.querySelector('.timeline-container'),
    handle: 'top',
    minHeight: 80,
    maxHeight: 450
  });
}

function setupHorizontalResize({ panel, handle, minWidth, maxWidth }) {
  if (!panel) return;

  // Create resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = `resize-handle resize-handle-${handle}`;
  panel.appendChild(resizeHandle);

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = panel.offsetWidth;
    
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    resizeHandle.classList.add('active');
    
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    let newWidth;
    if (handle === 'right') {
      newWidth = startWidth + (e.clientX - startX);
    } else {
      newWidth = startWidth - (e.clientX - startX);
    }

    // Apply constraints
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    panel.style.width = `${newWidth}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      resizeHandle.classList.remove('active');
    }
  });
}

function setupVerticalResize({ panel, handle, minHeight, maxHeight }) {
  if (!panel) return;

  // Create resize handle
  const resizeHandle = document.createElement('div');
  resizeHandle.className = `resize-handle resize-handle-${handle}`;
  panel.appendChild(resizeHandle);

  let isResizing = false;
  let startY = 0;
  let startHeight = 0;

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startY = e.clientY;
    startHeight = panel.offsetHeight;
    
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    resizeHandle.classList.add('active');
    
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    let newHeight;
    if (handle === 'bottom') {
      newHeight = startHeight + (e.clientY - startY);
    } else {
      newHeight = startHeight - (e.clientY - startY);
    }

    // Apply constraints
    newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
    panel.style.height = `${newHeight}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      resizeHandle.classList.remove('active');
    }
  });
}

// Video Preview Mode
let isVideoMode = true;

function initializeVideoPreview() {
  const demoVideo = document.getElementById("demoVideo");
  const videoContainer = document.getElementById("videoPreviewContainer");
  const animationCanvas = document.getElementById("animationCanvas");
  const canvasOverlay = document.getElementById("canvasOverlay");
  const canvasGrid = document.getElementById("canvasGrid");
  const switchToCanvasBtn = document.getElementById("switchToCanvasBtn");
  const switchToVideoBtn = document.getElementById("switchToVideoBtn");
  
  if (!demoVideo) return;
  
  // Sync video with playback controls
  setupVideoPlaybackControls(demoVideo);
  
  // Mode switching
  if (switchToCanvasBtn) {
    switchToCanvasBtn.addEventListener("click", () => {
      switchToCanvasMode();
    });
  }
  
  if (switchToVideoBtn) {
    switchToVideoBtn.addEventListener("click", () => {
      switchToVideoMode();
    });
  }
  
  // Update frame counter based on video time
  demoVideo.addEventListener("timeupdate", () => {
    if (isVideoMode && !isPlaying) {
      const progress = demoVideo.currentTime / demoVideo.duration;
      const frame = Math.floor(progress * totalFrames) + 1;
      updateFrameDisplay(frame);
    }
  });
  
  // When video loads, update total frames based on video duration
  demoVideo.addEventListener("loadedmetadata", () => {
    totalFrames = Math.floor(demoVideo.duration * fps);
    updateFrameDisplay(1);
    updateTimelineScrubber();
    
    // Update FPS display
    const fpsDisplay = document.getElementById("fpsDisplay");
    if (fpsDisplay) {
      fpsDisplay.textContent = fps;
    }
    
    // Update total frames display
    const totalFramesEl = document.getElementById("totalFrames");
    if (totalFramesEl) {
      totalFramesEl.textContent = totalFrames;
    }
  });
}

function setupVideoPlaybackControls(video) {
  const playPauseBtn = document.getElementById("playPauseBtn");
  const firstFrameBtn = document.getElementById("firstFrameBtn");
  const prevFrameBtn = document.getElementById("prevFrameBtn");
  const nextFrameBtn = document.getElementById("nextFrameBtn");
  const lastFrameBtn = document.getElementById("lastFrameBtn");
  const loopToggleBtn = document.getElementById("loopToggleBtn");
  
  // Override play/pause for video mode
  if (playPauseBtn) {
    playPauseBtn.addEventListener("click", () => {
      if (isVideoMode) {
        toggleVideoPlayPause(video);
      }
    });
  }
  
  // First frame
  if (firstFrameBtn) {
    firstFrameBtn.addEventListener("click", () => {
      if (isVideoMode) {
        video.currentTime = 0;
        updateFrameDisplay(1);
      }
    });
  }
  
  // Previous frame
  if (prevFrameBtn) {
    prevFrameBtn.addEventListener("click", () => {
      if (isVideoMode) {
        video.currentTime = Math.max(0, video.currentTime - (1 / fps));
        const frame = Math.floor((video.currentTime / video.duration) * totalFrames) + 1;
        updateFrameDisplay(frame);
      }
    });
  }
  
  // Next frame
  if (nextFrameBtn) {
    nextFrameBtn.addEventListener("click", () => {
      if (isVideoMode) {
        video.currentTime = Math.min(video.duration, video.currentTime + (1 / fps));
        const frame = Math.floor((video.currentTime / video.duration) * totalFrames) + 1;
        updateFrameDisplay(frame);
      }
    });
  }
  
  // Last frame
  if (lastFrameBtn) {
    lastFrameBtn.addEventListener("click", () => {
      if (isVideoMode) {
        video.currentTime = video.duration;
        updateFrameDisplay(totalFrames);
      }
    });
  }
  
  // Loop toggle
  if (loopToggleBtn) {
    loopToggleBtn.addEventListener("click", () => {
      video.loop = !video.loop;
    });
  }
  
  // Video ended event
  video.addEventListener("ended", () => {
    if (!video.loop) {
      isPlaying = false;
      updatePlayPauseButton();
    }
  });
  
  // Video play/pause events
  video.addEventListener("play", () => {
    isPlaying = true;
    updatePlayPauseButton();
  });
  
  video.addEventListener("pause", () => {
    isPlaying = false;
    updatePlayPauseButton();
  });
}

function toggleVideoPlayPause(video) {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

function updatePlayPauseButton() {
  const playPauseIcon = document.getElementById("playPauseIcon");
  const playPauseLabel = document.getElementById("playPauseLabel");
  
  if (playPauseIcon) {
    playPauseIcon.textContent = isPlaying ? "⏸" : "▶";
  }
  if (playPauseLabel) {
    playPauseLabel.textContent = isPlaying ? "Pause" : "Play";
  }
}

function updateFrameDisplay(frame) {
  currentFrame = frame;
  const currentFrameEl = document.getElementById("currentFrame");
  const totalFramesEl = document.getElementById("totalFrames");
  
  if (currentFrameEl) {
    currentFrameEl.textContent = frame;
  }
  if (totalFramesEl) {
    totalFramesEl.textContent = totalFrames;
  }
  updateTimelineScrubber();
}

function updateTimelineScrubber() {
  const scrubber = document.getElementById("timelineScrubber");
  if (scrubber && totalFrames > 0) {
    const percentage = ((currentFrame - 1) / (totalFrames - 1)) * 100;
    scrubber.style.left = `${percentage}%`;
  }
}

function switchToCanvasMode() {
  isVideoMode = false;
  const videoContainer = document.getElementById("videoPreviewContainer");
  const animationCanvas = document.getElementById("animationCanvas");
  const canvasOverlay = document.getElementById("canvasOverlay");
  const demoVideo = document.getElementById("demoVideo");
  
  // Pause video
  if (demoVideo) demoVideo.pause();
  
  // Hide video, show canvas
  if (videoContainer) videoContainer.classList.add("hidden");
  if (animationCanvas) animationCanvas.classList.remove("hidden");
  if (canvasOverlay) canvasOverlay.classList.remove("hidden");
  
  // Reset playback state
  isPlaying = false;
  updatePlayPauseButton();
}

function switchToVideoMode() {
  isVideoMode = true;
  const videoContainer = document.getElementById("videoPreviewContainer");
  const animationCanvas = document.getElementById("animationCanvas");
  const canvasOverlay = document.getElementById("canvasOverlay");
  const canvasGrid = document.getElementById("canvasGrid");
  
  // Show video, hide canvas
  if (videoContainer) videoContainer.classList.remove("hidden");
  if (animationCanvas) animationCanvas.classList.add("hidden");
  if (canvasOverlay) canvasOverlay.classList.add("hidden");
  if (canvasGrid) canvasGrid.classList.add("hidden");
}

// Initialize resizable panels on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initializeResizablePanels();
});
