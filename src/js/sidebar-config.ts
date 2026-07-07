// Sidebar Configuration
// This file contains the menu structure and navigation variables for the HRIS Hub

export interface MenuItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  parentId: string | null;
  children: MenuItem[];
}

export const sidebarConfig = {
  // Menu structure with parent-child relationships
  menuItems: [
    {
      id: 'overview',
      name: 'Overview',
      url: '/',
      icon: 'home',
      parentId: null,
      children: []
    },
    {
      id: 'components',
      name: 'Components',
      url: '#',
      icon: 'layers',
      parentId: null,
      children: [
        {
          id: 'create-component-1',
          name: 'Dynamic Component Builder',
          url: '/components/create-component-1',
          icon: 'settings',
          parentId: 'components',
          children: []
        },
        {
          id: 'create-component-2',
          name: 'Strapi-like Component Builder',
          url: '/components/create-component-2',
          icon: 'sliders',
          parentId: 'components',
          children: []
        }
      ]
    },
    {
      id: 'threshold',
      name: 'Threshold Settings',
      url: '/threshold',
      icon: 'tune',
      parentId: null,
      children: []
    }
  ] as MenuItem[],
  
  // Track expanded menu items
  expandedMenus: new Set<string>(),
  
  // Helper function to get menu item by ID
  getMenuItemById(id: string): MenuItem | null {
    const findItem = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children.length > 0) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findItem(this.menuItems);
  },
  
  // Helper function to get active menu item based on current URL
  getActiveMenuItem(): MenuItem | null {
    const currentPath = window.location.pathname;
    const findActive = (items: MenuItem[]): MenuItem | null => {
      for (const item of items) {
        // Use exact path matching for better accuracy
        if (item.url && currentPath === item.url) return item;
        if (item.children.length > 0) {
          const found = findActive(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findActive(this.menuItems);
  },
  
  // Helper function to get parent menu item
  getParentMenuItem(itemId: string): MenuItem | null {
    const findParent = (items: MenuItem[], targetId: string, parent: MenuItem | null = null): MenuItem | null => {
      for (const item of items) {
        if (item.id === targetId) return parent;
        if (item.children.length > 0) {
          const found = findParent(item.children, targetId, item);
          if (found) return found;
        }
      }
      return null;
    };
    return findParent(this.menuItems, itemId);
  }
};

// Icon mapping (using Lucide icons)
const iconMap: Record<string, string> = {
  'home': '<i data-lucide="home" class="w-5 h-5"></i>',
  'layers': '<i data-lucide="layers" class="w-5 h-5"></i>',
  'settings': '<i data-lucide="settings" class="w-5 h-5"></i>',
  'sliders': '<i data-lucide="sliders" class="w-5 h-5"></i>',
  'tune': '<i data-lucide="tune" class="w-5 h-5"></i>',
  'chevron-down': '<i data-lucide="chevron-down" class="w-4 h-4"></i>',
  'chevron-right': '<i data-lucide="chevron-right" class="w-4 h-4"></i>'
};

function renderMenuItem(item: MenuItem, isActive: boolean, hasChildren: boolean, activeItem: MenuItem | null): string {
  const iconHtml = iconMap[item.icon] || '';
  const activeClass = isActive ? 'bg-[#F1F1EF] text-[#37352F]' : 'text-[#787774] hover:bg-[#F1F1EF] hover:text-[#37352F]';
  const isExpanded = sidebarConfig.expandedMenus.has(item.id);
  const chevronHtml = hasChildren ? (isExpanded ? iconMap['chevron-down'] : iconMap['chevron-right']) : '';
  
  let html = `
    <a href="${item.url}" 
       class="menu-item flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition ${activeClass}"
       data-menu-id="${item.id}"
       ${hasChildren ? 'data-has-children="true"' : ''}>
      <div class="flex items-center gap-3">
        ${iconHtml}
        <span>${item.name}</span>
      </div>
      ${chevronHtml}
    </a>
  `;
  
  if (hasChildren) {
    const submenuClass = isExpanded ? '' : 'hidden';
    html += `<div class="submenu ml-6 mt-1 space-y-1 ${submenuClass}">`;
    item.children.forEach(child => {
      const isChildActive = activeItem && activeItem.id === child.id;
      const childActiveClass = isChildActive ? 'bg-[#EDECE9] text-[#37352F]' : 'text-[#787774] hover:bg-[#EDECE9] hover:text-[#37352F]';
      const childIconHtml = iconMap[child.icon] || '';
      
      html += `
        <a href="${child.url}" 
           class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${childActiveClass}">
          ${childIconHtml}
          <span>${child.name}</span>
        </a>
      `;
    });
    html += '</div>';
  }
  
  return html;
}

function setupSidebarAccordion(): void {
  const menuItems = document.querySelectorAll('.menu-item[data-has-children="true"]');
  menuItems.forEach((item) => {
    item.addEventListener('click', function(this: HTMLElement, e: Event) {
      e.preventDefault();
      const menuId = this.getAttribute('data-menu-id');
      
      if (menuId) {
        // Toggle expanded state
        if (sidebarConfig.expandedMenus.has(menuId)) {
          sidebarConfig.expandedMenus.delete(menuId);
        } else {
          sidebarConfig.expandedMenus.add(menuId);
        }
        
        // Re-render to update UI
        renderSidebar();
      }
    });
  });
}

export function renderSidebar(): void {
  const sidebarContainer = document.getElementById('sidebarContainer');
  if (!sidebarContainer) return;
  
  const activeItem = sidebarConfig.getActiveMenuItem();
  
  // Auto-expand parent menu if active item is a child
  if (activeItem && activeItem.parentId) {
    sidebarConfig.expandedMenus.add(activeItem.parentId);
  }
  
  let html = '<nav class="space-y-1">';
  
  sidebarConfig.menuItems.forEach(item => {
    const isActive = activeItem ? (activeItem.id === item.id || activeItem.parentId === item.id) : false;
    const hasChildren = item.children && item.children.length > 0;
    
    html += `
      <div class="menu-group">
        ${renderMenuItem(item, isActive, hasChildren, activeItem)}
      </div>
    `;
  });
  
  html += '</nav>';
  sidebarContainer.innerHTML = html;
  
  // Initialize Lucide icons after rendering
  if (typeof (window as any).lucide !== 'undefined') {
    (window as any).lucide.createIcons();
  }
  
  // Setup accordion functionality
  setupSidebarAccordion();
}
