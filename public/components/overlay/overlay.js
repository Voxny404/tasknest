
// <div id="modalOverlay" class="modal-overlay hidden">
//   <div class="modal-content" id="modalContent">
//     <!-- Content gets injected here -->
//     <button id="closeModal" class="close-button">Close</button>
//   </div>
// </div>

function showOverlay (htmlContent) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');

    // Inject your HTML into the modal (excluding the close button)
    content.innerHTML = htmlContent + content.querySelector('#closeModal').outerHTML;
    
    overlay.classList.remove('hide');
    overlay.classList.remove('hidden');
    overlay.classList.add("show");

    // Re-attach close listener since we replaced innerHTML
    document.getElementById('closeModal').addEventListener('click', () => {
        overlay.classList.add('hidden');
        overlay.classList.remove('show');
    });
}
