// Popup script for Quick Search Jump extension
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const currentKeyDisplay = document.getElementById('currentKeyDisplay');
    const ctrlKey = document.getElementById('ctrlKey');
    const altKey = document.getElementById('altKey');
    const shiftKey = document.getElementById('shiftKey');
    const metaKey = document.getElementById('metaKey');
    const keyInput = document.getElementById('keyInput');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    const status = document.getElementById('status');
    
    // Current key binding
    let currentBinding = {
        key: 'f',
        ctrl: false,
        alt: false,
        shift: false,
        meta: false
    };
    
    // Load current binding from storage
    loadCurrentBinding();
    
    // Event listeners
    keyInput.addEventListener('focus', startKeyCapture);
    keyInput.addEventListener('blur', stopKeyCapture);
    saveBtn.addEventListener('click', saveBinding);
    resetBtn.addEventListener('click', resetToDefault);
    
    // Modifier key change listeners
    [ctrlKey, altKey, shiftKey, metaKey].forEach(checkbox => {
        checkbox.addEventListener('change', updateSaveButton);
    });
    
    // Function to load current binding from storage
    function loadCurrentBinding() {
        chrome.storage.local.get(['quickSearchJumpKeyBinding'], function(result) {
            if (result.quickSearchJumpKeyBinding) {
                currentBinding = result.quickSearchJumpKeyBinding;
            }
            updateDisplay();
        });
    }
    
    // Function to update the display
    function updateDisplay() {
        // Update current binding display
        currentKeyDisplay.textContent = formatKeyBinding(currentBinding);
        
        // Update form fields
        ctrlKey.checked = currentBinding.ctrl;
        altKey.checked = currentBinding.alt;
        shiftKey.checked = currentBinding.shift;
        metaKey.checked = currentBinding.meta;
        keyInput.value = currentBinding.key.toUpperCase();
        
        // Update save button state
        updateSaveButton();
    }
    
    // Function to format key binding for display
    function formatKeyBinding(binding) {
        const parts = [];
        
        if (binding.ctrl) parts.push('Ctrl');
        if (binding.alt) parts.push('Alt');
        if (binding.shift) parts.push('Shift');
        if (binding.meta) parts.push('Cmd');
        
        if (binding.key && binding.key !== '') {
            parts.push(binding.key.toUpperCase());
        }
        
        return parts.join(' + ') || 'F';
    }
    
    // Function to start key capture
    function startKeyCapture() {
        keyInput.value = '';
        keyInput.placeholder = 'Press any key...';
        
        // Add global key listener
        document.addEventListener('keydown', captureKey);
        
        // Focus the input to ensure it captures keys
        keyInput.focus();
    }
    
    // Function to stop key capture
    function stopKeyCapture() {
        document.removeEventListener('keydown', captureKey);
        keyInput.placeholder = 'Press a key...';
        
        // If no key was captured, restore the current value
        if (keyInput.value === '') {
            keyInput.value = currentBinding.key.toUpperCase();
        }
    }
    
    // Function to capture key presses
    function captureKey(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the key (handle special keys)
        let key = e.key.toLowerCase();
        
        // Handle special keys
        if (key === 'control' || key === 'alt' || key === 'shift' || key === 'meta') {
            return; // Ignore modifier keys alone
        }
        
        // Handle function keys and other special keys
        if (key.length > 1) {
            // For function keys, arrow keys, etc., use the key as is
            key = e.key;
        }
        
        // Update the input field
        keyInput.value = key.toUpperCase();
        
        // Update save button state
        updateSaveButton();
        
        // Remove the key listener
        document.removeEventListener('keydown', captureKey);
        
        // Blur the input to stop capture
        keyInput.blur();
    }
    
    // Function to update save button state
    function updateSaveButton() {
        const hasKey = keyInput.value.trim() !== '';
        
        // Enable save button if we have a key (modifiers are optional)
        saveBtn.disabled = !hasKey;
    }
    
    // Function to save the binding
    function saveBinding() {
        const newBinding = {
            key: keyInput.value.toLowerCase(),
            ctrl: ctrlKey.checked,
            alt: altKey.checked,
            shift: shiftKey.checked,
            meta: metaKey.checked
        };
        
        // Save to storage
        chrome.storage.local.set({ 'quickSearchJumpKeyBinding': newBinding }, function() {
            if (chrome.runtime.lastError) {
                showStatus('Error saving binding: ' + chrome.runtime.lastError.message, 'error');
            } else {
                // Update current binding
                currentBinding = newBinding;
                updateDisplay();
                showStatus('Key binding saved successfully!', 'success');
                
                // Send message to content script to update binding
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateKeyBinding',
                            binding: newBinding
                        });
                    }
                });
            }
        });
    }
    
    // Function to reset to default
    function resetToDefault() {
        const defaultBinding = {
            key: 'f',
            ctrl: false,
            alt: false,
            shift: false,
            meta: false
        };
        
        // Save to storage
        chrome.storage.local.set({ 'quickSearchJumpKeyBinding': defaultBinding }, function() {
            if (chrome.runtime.lastError) {
                showStatus('Error resetting binding: ' + chrome.runtime.lastError.message, 'error');
            } else {
                // Update current binding
                currentBinding = defaultBinding;
                updateDisplay();
                showStatus('Reset to default (F key)', 'success');
                
                // Send message to content script to update binding
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateKeyBinding',
                            binding: defaultBinding
                        });
                    }
                });
            }
        });
    }
    
    // Function to show status message
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
});
