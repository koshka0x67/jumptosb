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
    
    // If not focused on search, find and activate search input
    if (!isSearchInput) {
      const searchResult = findSearchInputSmart();
      if (searchResult) {
        console.log('Quick Search Jump: Found search element, activating it:', searchResult);
        activateSearchElement(searchResult);
        e.preventDefault();
        e.stopPropagation();
      } else {
        console.log('Quick Search Jump: No search input found');
      }
    } else {
      console.log('Quick Search Jump: Already focused on search, ignoring key combination');
    }
  }
  

}

// Function to activate a search element (click, focus, or both)
function activateSearchElement(element) {
  try {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'input' || tagName === 'textarea') {
      // For input elements, simulate real mouse click
      console.log('Quick Search Jump: Activating input element with mouse click');
      
      // Method 1: Simulate real mouse click event
      try {
        // Create and dispatch mouse events to simulate real user interaction
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Mouse down event
        const mouseDownEvent = new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(mouseDownEvent);
        
        // Mouse up event
        const mouseUpEvent = new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(mouseUpEvent);
        
        // Click event
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(clickEvent);
        
        console.log('Quick Search Jump: Mouse click simulation successful');
        
        // Method 2: Also try to focus after the click
        setTimeout(() => {
          try {
            element.focus();
            console.log('Quick Search Jump: Focus after click successful');
          } catch (focusError) {
            console.log('Quick Search Jump: Focus after click failed:', focusError);
          }
        }, 50);
        
      } catch (clickError) {
        console.log('Quick Search Jump: Mouse click simulation failed, trying fallback:', clickError);
        
        // Fallback: Try regular click and focus
        try {
          element.click();
          element.focus();
          console.log('Quick Search Jump: Fallback click/focus successful');
        } catch (fallbackError) {
          console.log('Quick Search Jump: Fallback also failed:', fallbackError);
        }
      }
      
    } else if (tagName === 'button' || element.getAttribute('role') === 'button') {
      // For button elements, simulate real mouse click
      console.log('Quick Search Jump: Activating button element with mouse click');
      try {
        // Simulate real mouse click on button
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Mouse down event
        const mouseDownEvent = new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(mouseDownEvent);
        
        // Mouse up event
        const mouseUpEvent = new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(mouseUpEvent);
        
        // Click event
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(clickEvent);
        
        console.log('Quick Search Jump: Button mouse click simulation successful');
        
        // Wait a bit for the search input to appear, then try to focus it
        setTimeout(() => {
          const searchInput = findSearchInputSmart();
          if (searchInput && searchInput.tagName.toLowerCase() === 'input') {
            console.log('Quick Search Jump: Found search input after button click, activating it');
            activateSearchElement(searchInput); // Recursively activate the input
          }
        }, 300);
        
      } catch (clickError) {
        console.log('Quick Search Jump: Button mouse click simulation failed:', clickError);
      }
    } else {
      // For other elements, simulate real mouse click
      console.log('Quick Search Jump: Activating other element type with mouse click:', tagName);
      try {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Mouse down event
        const mouseDownEvent = new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(mouseDownEvent);
        
        // Mouse up event
        const mouseUpEvent = new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(mouseUpEvent);
        
        // Click event
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: centerX,
          clientY: centerY,
          button: 0
        });
        element.dispatchEvent(clickEvent);
        
        console.log('Quick Search Jump: Other element mouse click simulation successful');
      } catch (clickError) {
        console.log('Quick Search Jump: Other element mouse click simulation failed:', clickError);
      }
    }
    
  } catch (error) {
    console.log('Quick Search Jump: Error activating search element:', error);
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

  // Simple approach: Find all elements with "search" in their attributes
  const searchElements = findAllElementsWithSearch();
  console.log('Quick Search Jump: Found elements with "search":', searchElements.length);

  // Filter to only inputs and score them
  const allSearchInputs = searchElements
    .filter(element => element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea');

  console.log('Quick Search Jump: Search elements that are inputs:', allSearchInputs.length);

  // Also look for search containers that might contain inputs
  const searchContainers = searchElements.filter(element => {
    const tagName = element.tagName.toLowerCase();
    return tagName === 'div' || tagName === 'form' || tagName === 'button';
  });

  console.log('Quick Search Jump: Search containers found:', searchContainers.length);

  // Look for inputs inside search containers
  const inputsInContainers = [];
  for (const container of searchContainers) {
    const inputs = container.querySelectorAll('input, textarea');
    for (const input of inputs) {
      if (!allSearchInputs.includes(input)) {
        inputsInContainers.push(input);
        console.log('Quick Search Jump: Found input in search container:', {
          container: container,
          input: input,
          inputName: input.name,
          inputType: input.type,
          inputPlaceholder: input.placeholder
        });
      }
    }
  }

  // Combine all inputs
  const allInputs = [...allSearchInputs, ...inputsInContainers];
  console.log('Quick Search Jump: Total inputs found (direct + in containers):', allInputs.length);

  const visibleSearchInputs = allInputs.filter(input => {
    const visible = isVisible(input);
    if (!visible) {
      console.log('Quick Search Jump: Input filtered out (not visible):', {
        input: input,
        name: input.name,
        type: input.type,
        placeholder: input.placeholder,
        rect: input.getBoundingClientRect()
      });
    }
    return visible;
  });

  console.log('Quick Search Jump: Visible search inputs:', visibleSearchInputs.length);

  const searchInputs = visibleSearchInputs
    .map(input => ({
      element: input,
      score: calculateSearchScore(input)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  console.log('Quick Search Jump: Scored search inputs:', searchInputs);

  if (searchInputs.length > 0) {
    const bestInput = searchInputs[0];
    console.log('Quick Search Jump: Best search input found:', bestInput);
    highlightElement(bestInput.element, 'green');
    return bestInput.element;
  }

  // Fallback: Look for search buttons
  const searchButton = findSearchButton();
  if (searchButton) {
    console.log('Quick Search Jump: Found search button:', searchButton);
    highlightElement(searchButton, 'blue');
    return searchButton;
  }

  console.log('Quick Search Jump: No search input found');
  return null;
}

// Function to find all elements with "search" in their attributes
function findAllElementsWithSearch() {
  const searchElements = [];
  const allElements = document.querySelectorAll('*');
  
  console.log('Quick Search Jump: Checking', allElements.length, 'elements for search attributes...');
  
  for (const element of allElements) {
    // Check all relevant attributes for "search"
    const attributes = [
      element.id,
      element.name,
      element.className,
      element.getAttribute('placeholder'),
      element.getAttribute('aria-label'),
      element.getAttribute('title'),
      element.getAttribute('data-testid'),
      element.getAttribute('role'),
      element.getAttribute('type'),
      element.getAttribute('enterkeyhint'),
      element.getAttribute('autocomplete')
    ].filter(Boolean);
    
    // Check if any attribute contains "search"
    for (const attr of attributes) {
      // Ensure attr is a string before calling toLowerCase()
      if (typeof attr === 'string' && attr.toLowerCase().includes('search')) {
        searchElements.push(element);
        console.log('Quick Search Jump: Found element with "search" in attribute:', {
          attribute: attr,
          element: element,
          tagName: element.tagName,
          isInput: element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea',
          isVisible: isVisible(element)
        });
        break; // Don't add the same element twice
      }
    }
  }
  
  // Also check for common search patterns that don't contain "search" but are clearly search inputs
  const commonSearchInputs = document.querySelectorAll('input[name="q"], input[name="query"], input[type="search"]');
  console.log('Quick Search Jump: Found common search inputs:', commonSearchInputs.length);
  
  for (const input of commonSearchInputs) {
    if (!searchElements.includes(input)) {
      searchElements.push(input);
      console.log('Quick Search Jump: Added common search input:', {
        element: input,
        tagName: input.tagName,
        isInput: input.tagName.toLowerCase() === 'input' || input.tagName.toLowerCase() === 'textarea',
        isVisible: isVisible(input),
        name: input.name,
        type: input.type,
        placeholder: input.placeholder
      });
    }
  }
  
  console.log('Quick Search Jump: Total elements with "search" found:', searchElements.length);
  return searchElements;
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
    if (typeof attr === 'string') {
      const lower = attr.toLowerCase();
      if (lower.includes('search')) score += 12; // Higher score for "search"
      if (lower.includes('q')) score += 8;
      if (lower.includes('query')) score += 8;
      if (lower.includes('find')) score += 6;
      if (lower.includes('lookup')) score += 6;
    }
  }
  
  // Special scoring for common search patterns
  if (input.name === 'q') score += 15; // Very high score for name="q"
  if (input.name === 'query') score += 12;
  if (input.getAttribute('enterkeyhint') === 'search') score += 10;
  
  // Placeholder-based scoring
  if (input.placeholder && typeof input.placeholder === 'string') {
    const placeholder = input.placeholder.toLowerCase();
    if (placeholder.includes('search')) score += 10;
    if (placeholder.includes('find')) score += 6;
    if (placeholder.includes('look for')) score += 6;
  }
  
  // Position-based scoring
  const rect = input.getBoundingClientRect();
  if (rect.top < 200) score += 3; // Near top of page
  if (rect.left < 300) score += 2; // Near left side
  
  // Size-based scoring
  if (input.offsetWidth > 200) score += 2; // Wide input
  if (input.offsetHeight > 30) score += 1; // Tall input
  
  // Bonus for inputs that are clearly search-related
  if (input.getAttribute('role') === 'searchbox') score += 10;
  if (input.getAttribute('data-testid') && typeof input.getAttribute('data-testid') === 'string' && input.getAttribute('data-testid').toLowerCase().includes('search')) score += 8;
  
  console.log('Quick Search Jump: Input scored:', {
    element: input,
    score: score,
    name: input.name,
    placeholder: input.placeholder,
    type: input.type,
    enterkeyhint: input.getAttribute('enterkeyhint')
  });
  
  return score;
}

// Function to check if an element is visible
function isVisible(element) {
  if (!element) return false;
  
  try {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    // Basic visibility checks
    const display = style.display;
    const visibility = style.visibility;
    const opacity = parseFloat(style.opacity);
    
    // Check if element has dimensions and is not hidden
    const hasSize = rect.width > 0 && rect.height > 0;
    const isNotHidden = display !== 'none' && visibility !== 'hidden' && opacity > 0;
    const hasParent = element.offsetParent !== null;
    
    let isVisible = hasSize && isNotHidden && hasParent;
    
    // For Reddit and similar sites, be very lenient with visibility
    // If it's an input with search-related attributes, consider it visible even if strict checks fail
    if (!isVisible && element.tagName.toLowerCase() === 'input') {
      const hasSearchAttributes = (
        element.name === 'q' ||
        element.name === 'query' ||
        element.getAttribute('enterkeyhint') === 'search' ||
        (element.placeholder && element.placeholder.toLowerCase().includes('search')) ||
        element.type === 'search' ||
        element.id === 'search' ||
        element.id === 'searchInput' ||
        (element.className && typeof element.className === 'string' && element.className.toLowerCase().includes('search'))
      );

      if (hasSearchAttributes) {
        console.log('Quick Search Jump: Input has search attributes, considering visible despite strict check:', {
          element: element,
          name: element.name,
          placeholder: element.placeholder,
          enterkeyhint: element.getAttribute('enterkeyhint'),
          type: element.type,
          id: element.id,
          className: element.className,
          rect: { width: rect.width, height: rect.height },
          display: display,
          visibility: visibility,
          opacity: opacity,
          offsetParent: element.offsetParent
        });
        return true; // Be very lenient for search inputs
      }
    }
    
    // Also be lenient for elements inside search containers
    if (!isVisible) {
      const parent = element.parentElement;
      if (parent) {
        const parentClassName = parent.className;
        const parentId = parent.id;
        if (typeof parentClassName === 'string' && parentClassName.toLowerCase().includes('search')) {
          console.log('Quick Search Jump: Element is inside search container, considering visible:', {
            element: element,
            parent: parent,
            parentClassName: parentClassName,
            parentId: parentId
          });
          return true;
        }
      }
    }
    
    return isVisible;
  } catch (error) {
    console.log('Quick Search Jump: Error checking visibility:', error);
    return false;
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
  