function showLoading(id = 'task-loading') {
    const loader = DOM[id];  // Use dynamic ID
    if (loader) loader.style.display = 'block';
}

function hideLoading(id = 'task-loading') {
    const loader = DOM[id];  // Use dynamic ID
    if (loader) loader.style.display = 'none';
}

function showFullscreenLoader(id = 'fullscreen-loading') {
    const loader = DOM[id];
    if (loader) loader.style.display = 'flex';
}

function hideFullscreenLoader(id = 'fullscreen-loading') {
    const loader = DOM[id];
    if (loader) loader.style.display = 'none';
}
