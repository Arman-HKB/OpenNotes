document.addEventListener('DOMContentLoaded', () => { // Wait for the DOM to load, the DOM is the HTML structure of the page
    const add_note = document.getElementById('add_note'); // Get the button element
    const whiteboard = document.getElementById('whiteboard'); // Get the whiteboard element
    let currentZIndex = 1; // Keep track of the z-index for each note note, so they stack properly on top of each other

    add_note.addEventListener('click', () => {
        createNote();
    }); // Add a new note note when the button is clicked

    const colors = ['#f9fc9d', '#bfccdf', '#f5b0a5', '#88caf9', '#f9c986', '#fab3e5', '#e6e6e6', '#dcbffd', '#94edb2'];
    let colorIndex = 0; // Initialize a variable to keep track of the current color

    let isCtrlPressed = false; // Variable to keep track of Ctrl key state

    // Load saved notes from local storage
    loadNotes();

    // Listen for Ctrl key press and release
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Control') {
            isCtrlPressed = true;
            toggleTextareas(false); // Disable textareas for dragging
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'Control') {
            isCtrlPressed = false;
            toggleTextareas(true); // Re-enable textareas for editing
        }
    });

    /**
     * Create a new note note and add it to the whiteboard.
     * The note note is a div element with a textarea inside it.
     * The textarea is used to allow the user to input text.
     * The note note is draggable, so the user can move it around the whiteboard.
     * The note note also resizes automatically based on the content of the textarea.
     * The note note is initially centered on the whiteboard.
     * The z-index of the note note is set to ensure it appears on top of other note notes.
     */
    function createNote(noteData) {
        const note = document.createElement('div');
        note.className = 'note';
        note.style.zIndex = currentZIndex++;
    
        // Assign color from the list
        note.style.backgroundColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length; // Update index and cycle through colors

        // Set properties from noteData if provided (for loading from storage)
        if (noteData) {
            note.style.left = `${noteData.left}px`;
            note.style.top = `${noteData.top}px`;
            note.style.backgroundColor = noteData.color;
            note.style.zIndex = noteData.zIndex;
            note.innerHTML = `<textarea>${noteData.content}</textarea>`;
            colorIndex = (colors.indexOf(noteData.color) + 1) % colors.length;
        } else {
            // Set default properties for new notes
            note.style.backgroundColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
            note.innerHTML = `<textarea></textarea>`;
        }

        const textarea = note.querySelector('textarea');
        textarea.maxLength = 100; // 175
        //textarea.addEventListener('input', autoResize);
        textarea.addEventListener('blur', saveNotes); // Save notes after editing
        textarea.addEventListener('mousedown', startDrag);
        note.appendChild(textarea);
    
        whiteboard.appendChild(note);
        makeDraggable(note);
        //autoResize.call(textarea); // Adjust size on creation

        // Center new note on screen
        if (!noteData) {
            const containerRect = whiteboard.getBoundingClientRect();
            const noteRect = note.getBoundingClientRect();
            note.style.left = `${(containerRect.width - noteRect.width) / 2}px`;
            note.style.top = `${(containerRect.height - noteRect.height) / 2}px`;
            saveNotes(); // Save new note to local storage
        }
    }
    
    /*function autoResize() {
        this.style.height = 'auto'; // Reset height to measure scrollHeight
        const newHeight = this.scrollHeight;
        this.style.height = `${newHeight}px`;

        // Adjust the note height based on textarea content
        const note = this.parentElement;
        note.style.height = `${newHeight + 20}px`; // +20 for padding

        // Update minimum size to ensure note isn't smaller than textarea
        adjustMinSize(note, this);
    }*/

    function startDrag(e) {
        if (e.target.tagName.toLowerCase() === 'textarea' && !isCtrlPressed) {
            e.stopPropagation(); // Allow normal textarea click if not dragging
        }
    }

    function makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;

        function onMouseMove(e) {
            if (isDragging) {
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        }

        function onMouseUp() {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            saveNotes(); // Save note position after dragging
        }

        element.addEventListener('mousedown', (e) => {
            if (e.target.tagName.toLowerCase() === 'textarea' && !isCtrlPressed) {
                return; // Ignore mousedown on textarea itself if not dragging
            }
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            element.style.zIndex = currentZIndex++;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    function toggleTextareas(enabled) {
        const textareas = document.querySelectorAll('.note textarea');
        textareas.forEach(textarea => {
            textarea.readOnly = !enabled;
            textarea.style.cursor = enabled ? 'text' : 'move';
        });
    }

    /*function adjustMinSize(note, textarea) {
        note.style.minWidth = `${textarea.scrollWidth + 20}px`; // +20 for padding
        note.style.minHeight = `${textarea.scrollHeight + 20}px`; // +20 for padding
    }*/

    function saveNotes() {
        const notes = [];
        document.querySelectorAll('.note').forEach(note => {
            const textarea = note.querySelector('textarea');
            notes.push({
                left: note.offsetLeft,
                top: note.offsetTop,
                width: note.offsetWidth,
                height: note.offsetHeight,
                color: note.style.backgroundColor,
                zIndex: parseInt(note.style.zIndex, 10),
                content: textarea.value
            });
        });
        localStorage.setItem('open_notes_save', JSON.stringify(notes));
    }

    function loadNotes() {
        const savedNotes = JSON.parse(localStorage.getItem('open_notes_save')) || [];
        savedNotes.forEach(noteData => createNote(noteData));
    }
});