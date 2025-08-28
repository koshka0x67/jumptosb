// Smart search focus with customizable key binding (Chrome & Firefox compatible)
console.log('Quick Search Jump: Content script loading...');

// Default key binding (can be customized)
let currentKeyBinding = {
  key: 'f',
  ctrl: false,
  alt: false,
  shift: false,
  meta: false
};

// Load saved key binding from storage
loadKeyBinding();

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateKeyBinding') {
    console.log('Quick Search Jump: Received key binding update:', request.binding);
    currentKeyBinding = request.binding;
    sendResponse({success: true});
  }
});

// Ensure DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

function initializeExtension() {
  console.log('Quick Search Jump: Initializing extension...');
  
  // Add event listener for the custom key binding
  document.addEventListener('keydown', handleKeyPress);
  
  console.log('Quick Search Jump: Extension initialized successfully');
}

// Function to handle key presses
function handleKeyPress(e) {
  // Check if the pressed key combination matches our binding
  if (e.key.toLowerCase() === currentKeyBinding.key &&
      e.ctrlKey === currentKeyBinding.ctrl &&
      e.altKey === currentKeyBinding.alt &&
      e.shiftKey === currentKeyBinding.shift &&
      e.metaKey === currentKeyBinding.meta) {
    
    console.log('Quick Search Jump: Custom key combination pressed');
    
    // Check if we're already focused on a search input
    const activeElement = document.activeElement;
    const isSearchInput = isSearchElement(activeElement);
    
    console.log('Quick Search Jump: Active element is search input:', isSearchInput);
    
    // If not focused on search, find and focus search input
    if (!isSearchInput) {
      const searchResult = findSearchInputSmart();
      if (searchResult) {
        if (searchResult.type === 'button') {
          console.log('Quick Search Jump: Found search button, clicking it:', searchResult);
          searchResult.click();
          // Wait a bit for the input to appear, then try to focus it
          setTimeout(() => {
            const searchInput = findSearchInputSmart();
            if (searchInput && searchInput.type !== 'button') {
              searchInput.focus();
            }
          }, 300);
        } else {
          console.log('Quick Search Jump: Found search input, focusing:', searchResult);
          searchResult.focus();
        }
        e.preventDefault();
      } else {
        console.log('Quick Search Jump: No search input found');
      }
    } else {
      console.log('Quick Search Jump: Already focused on search, ignoring key combination');
    }
  }
}

// Function to check if an element is a search input
function isSearchElement(element) {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  if (tagName !== 'input' && tagName !== 'textarea') return false;
  
  // Check if it has search-related attributes
  const searchIndicators = [
    element.name?.toLowerCase(),
    element.id?.toLowerCase(),
    element.placeholder?.toLowerCase(),
    element.className?.toLowerCase(),
    element.getAttribute('aria-label')?.toLowerCase(),
    element.getAttribute('title')?.toLowerCase(),
    element.getAttribute('data-testid')?.toLowerCase(),
    element.getAttribute('role')?.toLowerCase(),
    element.getAttribute('enterkeyhint')?.toLowerCase()
  ].filter(Boolean);
  
  return searchIndicators.some(indicator => 
    indicator.includes('search') || 
    indicator.includes('q') ||
    indicator.includes('query') ||
    indicator.includes('find') ||
    indicator.includes('lookup')
  ) || element.type === 'search';
}

// Smart function to find search inputs on any page
function findSearchInputSmart() {
  console.log('Quick Search Jump: Searching for search inputs...');
  
  // Strategy 1: Look for obvious search inputs first
  const obviousSearch = findObviousSearchInputs();
  if (obviousSearch) {
    console.log('Quick Search Jump: Found obvious search input:', obviousSearch);
    highlightElement(obviousSearch, 'green');
    return obviousSearch;
  }
  
  // Strategy 2: Look for search buttons with "Search" text
  const searchButton = findSearchButton();
  if (searchButton) {
    console.log('Quick Search Jump: Found search button:', searchButton);
    highlightElement(searchButton, 'blue');
    return searchButton;
  }
  
  // Strategy 3: Look for inputs near search-related text
  const contextualSearch = findContextualSearchInputs();
  if (contextualSearch) {
    console.log('Quick Search Jump: Found contextual search input:', contextualSearch);
    highlightElement(contextualSearch, 'orange');
    return contextualSearch;
  }
  
  // Strategy 4: Look for inputs in common search locations
  const positionedSearch = findPositionedSearchInputs();
  if (positionedSearch) {
    console.log('Quick Search Jump: Found positioned search input:', positionedSearch);
    highlightElement(positionedSearch, 'purple');
    return positionedSearch;
  }
  
  // Strategy 5: Fallback to any input that looks promising
  const fallbackSearch = findFallbackSearchInputs();
  if (fallbackSearch) {
    console.log('Quick Search Jump: Found fallback search input:', fallbackSearch);
    highlightElement(fallbackSearch, 'red');
    return fallbackSearch;
  }
  
  console.log('Quick Search Jump: No search input found with any strategy');
  return null;
}

// Strategy 1: Find obvious search inputs
function findObviousSearchInputs() {
  const selectors = [
    'input[type="search"]',
    'input[placeholder*="Search"]',
    'input[placeholder*="search"]',
    'input[name*="search"]',
    'input[name*="q"]',
    'input[name*="query"]',
    'input[id*="search"]',
    'input[class*="search"]',
    'textarea[name*="search"]',
    'textarea[name*="q"]',
    'textarea[name*="query"]',
    // Additional common patterns
    'input[enterkeyhint="search"]',
    'input[autocomplete*="search"]',
    'input[data-testid*="search"]',
    'input[aria-label*="search"]'
  ];
  
  for (const selector of selectors) {
    const input = document.querySelector(selector);
    if (input && isVisible(input)) return input;
  }
  
  // Strategy 1.5: Find any input containing "search" mixed with other words
  const allInputs = Array.from(document.querySelectorAll('input, textarea'));
  for (const input of allInputs) {
    if (!isVisible(input)) continue;
    
    // Check all attributes for "search" mixed with other words
    const attributes = [
      input.name, input.id, input.placeholder, 
      input.className, input.getAttribute('aria-label'),
      input.getAttribute('title'), input.getAttribute('data-testid'),
      input.getAttribute('enterkeyhint'), input.getAttribute('autocomplete')
    ].filter(Boolean);
    
    for (const attr of attributes) {
      if (attr.toLowerCase().includes('search')) {
        return input;
      }
    }
  }
  
  return null;
}

// Strategy 2: Find search buttons with "Search" text
function findSearchButton() {
  // Look for buttons, divs, or spans that contain "Search" text
  const searchTexts = ['Search', 'search', 'SEARCH'];
  
  for (const text of searchTexts) {
    // Find text nodes containing "Search"
    const textNodes = findTextNodes(text);
    for (const node of textNodes) {
      // Look for clickable elements containing this text
      const clickableElement = findClickableElementWithText(node);
      if (clickableElement && isVisible(clickableElement)) {
        return clickableElement;
      }
    }
  }
  
  return null;
}

// Helper function to find clickable elements containing search text
function findClickableElementWithText(textNode) {
  let element = textNode.parentElement;
  let depth = 0;
  const maxDepth = 8; // Go deeper for TikTok-like structures
  
  while (element && depth < maxDepth) {
    // Check if this element is clickable
    if (isClickableElement(element)) {
      return element;
    }
    
    // Also check if this element contains the search text
    if (element.textContent && element.textContent.toLowerCase().includes('search')) {
      // Look for clickable children
      const clickableChild = element.querySelector('button, [role="button"], [tabindex], [onclick], [data-testid*="button"]');
      if (clickableChild) {
        return clickableChild;
      }
    }
    
    element = element.parentElement;
    depth++;
  }
  
  return null;
}

// Helper function to check if element is clickable
function isClickableElement(element) {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const tabIndex = element.getAttribute('tabindex');
  const onClick = element.getAttribute('onclick');
  
  // Check for various clickable indicators
  return tagName === 'button' ||
         tagName === 'a' ||
         role === 'button' ||
         tabIndex !== null ||
         onClick !== null ||
         element.getAttribute('data-testid')?.includes('button') ||
         element.classList.contains('button') ||
         element.classList.contains('btn') ||
         element.onclick !== null ||
         element.addEventListener !== undefined;
}

// Strategy 3: Find inputs near search-related text
function findContextualSearchInputs() {
  // Look for text that suggests search functionality
  const searchTexts = [
    'search', 'Search', 'SEARCH',
    'find', 'Find', 'FIND',
    'lookup', 'Lookup', 'LOOKUP',
    'query', 'Query', 'QUERY'
  ];
  
  for (const text of searchTexts) {
    const textNodes = findTextNodes(text);
    for (const node of textNodes) {
      const nearbyInput = findInputNearText(node);
      if (nearbyInput && isVisible(nearbyInput)) return nearbyInput;
    }
  }
  
  return null;
}

// Strategy 4: Find inputs in common search locations
function findPositionedSearchInputs() {
  // Common search input locations
  const locations = [
    'header', 'Header', 'HEADER',
    'nav', 'Nav', 'NAV',
    'toolbar', 'Toolbar', 'TOOLBAR',
    'search', 'Search', 'SEARCH',
    'top', 'Top', 'TOP',
    'docsearch', 'DocSearch', 'DOCSEARCH',
    'tuxbutton', 'TUXButton', 'TUXBUTTON'
  ];
  
  for (const location of locations) {
    const container = document.querySelector(`[class*="${location}"], [id*="${location}"]`);
    if (container) {
      const input = container.querySelector('input, textarea');
      if (input && isVisible(input)) return input;
    }
  }
  
  return null;
}

// Strategy 5: Fallback to any input that looks promising
function findFallbackSearchInputs() {
  const allInputs = Array.from(document.querySelectorAll('input, textarea'));
  
  // Score each input based on how likely it is to be a search box
  const scoredInputs = allInputs
    .filter(input => isVisible(input))
    .map(input => ({
      element: input,
      score: calculateSearchScore(input)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return scoredInputs.length > 0 ? scoredInputs[0].element : null;
}

// Helper function to find text nodes containing specific text (cross-browser compatible)
function findTextNodes(text) {
  // Use TreeWalker if available, fallback to manual search
  if (document.createTreeWalker) {
    try {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            return node.textContent && node.textContent.includes(text) ? 
              NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      const nodes = [];
      let node;
      while (node = walker.nextNode()) {
        nodes.push(node);
      }
      return nodes;
    } catch (e) {
      // Fallback if TreeWalker fails
      console.log('TreeWalker failed, using fallback method');
    }
  }
  
  // Fallback: manual text search
  return findTextNodesFallback(text);
}

// Fallback method for finding text nodes
function findTextNodesFallback(text) {
  const nodes = [];
  const walkDOM = (element) => {
    if (element.nodeType === Node.TEXT_NODE) {
      if (element.textContent && element.textContent.includes(text)) {
        nodes.push(element);
      }
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < element.childNodes.length; i++) {
        walkDOM(element.childNodes[i]);
      }
    }
  };
  
  walkDOM(document.body);
  return nodes;
}

// Helper function to find input near text node
function findInputNearText(textNode) {
  let element = textNode.parentElement;
  let depth = 0;
  const maxDepth = 5;
  
  while (element && depth < maxDepth) {
    const input = element.querySelector('input, textarea');
    if (input) return input;
    
    element = element.parentElement;
    depth++;
  }
  
  return null;
}

// Helper function to calculate how likely an input is to be a search box
function calculateSearchScore(input) {
  let score = 0;
  
  // Type-based scoring
  if (input.type === 'search') score += 15;
  if (input.type === 'text') score += 5;
  
  // Attribute-based scoring
  const attributes = [
    input.name, input.id, input.placeholder, 
    input.className, input.getAttribute('aria-label'),
    input.getAttribute('title'), input.getAttribute('data-testid'),
    input.getAttribute('enterkeyhint'), input.getAttribute('autocomplete'),
    input.getAttribute('role')
  ].filter(Boolean);
  
  for (const attr of attributes) {
    const lower = attr.toLowerCase();
    if (lower.includes('search')) score += 12; // Higher score for "search"
    if (lower.includes('q')) score += 8;
    if (lower.includes('query')) score += 8;
    if (lower.includes('find')) score += 6;
    if (lower.includes('lookup')) score += 6;
  }
  
  // Position-based scoring
  const rect = input.getBoundingClientRect();
  if (rect.top < 200) score += 3; // Near top of page
  if (rect.left < 300) score += 2; // Near left side
  
  // Size-based scoring
  if (input.offsetWidth > 200) score += 2; // Wide input
  if (input.offsetHeight > 30) score += 1; // Tall input
  
  // Additional scoring for common search patterns
  if (input.placeholder && input.placeholder.toLowerCase().includes('search')) score += 6;
  if (input.name === 'q') score += 5; // Very common search name
  
  // Bonus for inputs that are clearly search-related
  if (input.getAttribute('role') === 'searchbox') score += 10;
  if (input.getAttribute('data-testid') && input.getAttribute('data-testid').toLowerCase().includes('search')) score += 8;
  
  return score;
}

// Helper function to check if element is visible (cross-browser compatible)
function isVisible(element) {
  if (!element) return false;
  
  try {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
    
    // Handle different browser implementations
    const display = style.display || style.getPropertyValue('display');
    const visibility = style.visibility || style.getPropertyValue('visibility');
    const opacity = style.opacity || style.getPropertyValue('opacity');
    
    return rect.width > 0 && 
           rect.height > 0 && 
           display !== 'none' && 
           visibility !== 'hidden' && 
           opacity !== '0' &&
           element.offsetParent !== null;
  } catch (e) {
    // Fallback for older browsers
    return element.offsetParent !== null && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }
}

// Helper function to highlight elements for debugging
function highlightElement(element, color) {
  if (!element) return;
  
  // Remove any existing highlights
  element.style.outline = '';
  element.style.outlineOffset = '';
  
  // Add highlight
  element.style.outline = `3px solid ${color}`;
  element.style.outlineOffset = '2px';
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    if (element.style.outline.includes(color)) {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }
  }, 3000);
}

// Function to save key binding to storage
function saveKeyBinding(binding) {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Chrome extension storage
      chrome.storage.local.set({ 'quickSearchJumpKeyBinding': binding });
    } else if (typeof browser !== 'undefined' && browser.storage) {
      // Firefox extension storage
      browser.storage.local.set({ 'quickSearchJumpKeyBinding': binding });
    } else {
      // Fallback to localStorage
      localStorage.setItem('quickSearchJumpKeyBinding', JSON.stringify(binding));
    }
    console.log('Quick Search Jump: Key binding saved');
  } catch (e) {
    console.log('Quick Search Jump: Could not save key binding:', e);
  }
}

// Function to load key binding from storage
function loadKeyBinding() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // Chrome extension storage
      chrome.storage.local.get(['quickSearchJumpKeyBinding'], (result) => {
        if (result.quickSearchJumpKeyBinding) {
          currentKeyBinding = result.quickSearchJumpKeyBinding;
          console.log('Quick Search Jump: Key binding loaded from Chrome storage:', currentKeyBinding);
        }
      });
    } else if (typeof browser !== 'undefined' && browser.storage) {
      // Firefox extension storage
      browser.storage.local.get(['quickSearchJumpKeyBinding']).then((result) => {
        if (result.quickSearchJumpKeyBinding) {
          currentKeyBinding = result.quickSearchJumpKeyBinding;
          console.log('Quick Search Jump: Key binding loaded from Firefox storage:', currentKeyBinding);
        }
      });
    } else {
      // Fallback to localStorage
      const saved = localStorage.getItem('quickSearchJumpKeyBinding');
      if (saved) {
        currentKeyBinding = JSON.parse(saved);
        console.log('Quick Search Jump: Key binding loaded from localStorage:', currentKeyBinding);
      }
    }
  } catch (e) {
    console.log('Quick Search Jump: Could not load key binding:', e);
  }
}
  