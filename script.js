document.addEventListener('DOMContentLoaded', () => { // Wait for the DOM to load, the DOM is the HTML structure of the page
    const add_note = document.getElementById('add_note'); // Get the button element
    const select_note = document.getElementById('select_note');
    const move_note = document.getElementById('move_note');
    const whiteboard = document.getElementById('whiteboard'); // Get the whiteboard element
    let currentZIndex = 1; // Keep track of the z-index for each note note, so they stack properly on top of each other

    add_note.addEventListener('click', () => {
        createNote();
    }); // Add a new note note when the button is clicked

    select_note.addEventListener('click', () => {
        isEditing = true;
        select_note.classList.add('active');
        move_note.classList.remove('active');
        updateMode();
    });

    move_note.addEventListener('click', () => {
        isEditing = false;
        move_note.classList.add('active');
        select_note.classList.remove('active');
        updateMode();
    });

    const colors = ['#f9fc9d', '#bfccdf', '#f5b0a5', '#88caf9', '#f9c986', '#fab3e5', '#e6e6e6', '#dcbffd', '#94edb2'];
    let colorIndex = 0; // Initialize a variable to keep track of the current color

    let isEditing = false; // Default to editing mode
    let isDragging = true; // Define isDragging globally
    let offsetX, offsetY; // Define offsetX and offsetY globally

    // Load saved notes from local storage
    loadNotes();

    function updateMode() {
        const textareas = document.querySelectorAll('.note textarea');
        textareas.forEach(textarea => {
            textarea.readOnly = !isEditing;
            textarea.style.cursor = isEditing ? 'default' : 'grab';
        });
    }

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

        if (noteData) {
            note.style.left = `${noteData.left}px`;
            note.style.top = `${noteData.top}px`;
            note.style.backgroundColor = noteData.color;
            note.style.zIndex = noteData.zIndex;
            note.innerHTML = `<textarea>${noteData.content}</textarea>`;
            colorIndex = (colors.indexOf(noteData.color) + 1) % colors.length;
        } else {
            note.style.backgroundColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
            note.innerHTML = `<textarea></textarea>`;
        }

        const textarea = note.querySelector('textarea');
        textarea.maxLength = 200;
        textarea.addEventListener('blur', saveNotes);
        //textarea.addEventListener('mousedown', startDrag);
        note.appendChild(textarea);

        const panel = document.createElement('div');
        panel.className = 'note-panel';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '<span class="material-symbols-outlined"> delete </span>';
        deleteButton.addEventListener('click', () => {
            note.remove();
            saveNotes();
        });

        panel.appendChild(deleteButton);
        note.appendChild(panel);

        whiteboard.appendChild(note);
        makeDraggable(note);

        updateMode();

        if (!noteData) {
            const containerRect = whiteboard.getBoundingClientRect();
            const noteRect = note.getBoundingClientRect();
            note.style.left = `${(containerRect.width - noteRect.width) / 2}px`;
            note.style.top = `${(containerRect.height - noteRect.height) / 2}px`;
            saveNotes();
        }

        isDragging = true;
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

    /*function startDrag(e) {
        if (e.target.tagName.toLowerCase() === 'textarea') {
            e.stopPropagation();
        }
    }*/

    function onMouseMove(e) {
        if (isDragging) {
            const note = document.querySelector('.note-dragging');
            if (note) {
                note.style.left = `${e.clientX - offsetX}px`;
                note.style.top = `${e.clientY - offsetY}px`;
            }
        }
    }

    function onMouseUp() {
        isDragging = false;
        const note = document.querySelector('.note-dragging');
        if (note) {
            note.classList.remove('note-dragging');
        }
        document.removeEventListener('mousemove', onMouseMove);
        saveNotes();
    }

    function makeDraggable(element) {
        element.addEventListener('mousedown', (e) => {
            if (isEditing) return;
            isDragging = true;
            element.classList.add('note-dragging');
            element.style.zIndex = currentZIndex++;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp, { once: true });
        });
    }

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

    /*function adjustMinSize(note, textarea) {
        note.style.minWidth = `${textarea.scrollWidth + 20}px`; // +20 for padding
        note.style.minHeight = `${textarea.scrollHeight + 20}px`; // +20 for padding
    }*/
});