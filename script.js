document.addEventListener('DOMContentLoaded', () => { // Wait for the DOM to load, the DOM is the HTML structure of the page
    const add_note = document.getElementById('add_note'); // Get the button element
    const whiteboard = document.getElementById('whiteboard'); // Get the whiteboard element
    let currentZIndex = 1; // Keep track of the z-index for each note note, so they stack properly on top of each other

    add_note.addEventListener('click', () => {
        createNote();
    }); // Add a new note note when the button is clicked

    /**
     * Create a new note note and add it to the whiteboard.
     * The note note is a div element with a textarea inside it.
     * The textarea is used to allow the user to input text.
     * The note note is draggable, so the user can move it around the whiteboard.
     * The note note also resizes automatically based on the content of the textarea.
     * The note note is initially centered on the whiteboard.
     * The z-index of the note note is set to ensure it appears on top of other note notes.
     */
    function createNote() {
        const note = document.createElement('div');
        note.className = 'note';
        note.style.zIndex = currentZIndex++;
    
        const textarea = document.createElement('textarea');
        textarea.addEventListener('input', autoResize);
        textarea.addEventListener('mousedown', startDrag);
        note.appendChild(textarea);
    
        whiteboard.appendChild(note);
        makeDraggable(note);
        autoResize.call(textarea); // Adjust size on creation
    
        // Center the post-it note on the screen
        const containerRect = whiteboard.getBoundingClientRect();
        const noteRect = note.getBoundingClientRect();
        note.style.left = `${(containerRect.width - noteRect.width) / 2}px`;
        note.style.top = `${(containerRect.height - noteRect.height) / 2}px`;
    }
    
    function autoResize() {
        this.style.height = 'auto'; // Reset height to measure scrollHeight
        const newHeight = this.scrollHeight;
        this.style.height = `${newHeight}px`;

        // Adjust the note height based on textarea content
        const note = this.parentElement;
        note.style.height = `${newHeight + 20}px`; // +20 for padding

        // Update minimum size to ensure note isn't smaller than textarea
        adjustMinSize(note, this);
    }

    function startDrag(e) {
        if (e.target.tagName.toLowerCase() === 'textarea') {
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
        }

        element.addEventListener('mousedown', (e) => {
            if (e.target.tagName.toLowerCase() === 'textarea') {
                return; // Ignore mousedown on textarea itself
            }
            isDragging = true;
            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            element.style.zIndex = currentZIndex++;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    function adjustMinSize(note, textarea) {
        note.style.minWidth = `${textarea.scrollWidth + 20}px`; // +20 for padding
        note.style.minHeight = `${textarea.scrollHeight + 20}px`; // +20 for padding
    }
});