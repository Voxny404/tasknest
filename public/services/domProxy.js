const DOM = (() => {
    const cache = {};
    return new Proxy({}, {
        get(_, id) {
            if (!cache[id] || !document.body.contains(cache[id])) {
                const el = document.getElementById(id);
                if (!el) console.warn(`DOM element with ID "${id}" not found`);
                cache[id] = el;
            }
            return cache[id];
        }
    });
})();
