/**
 * NotebookLM Subagent Helper Library
 * Protocolo Autonomía 100%
 */

window.NBLM = {
    selectors: {
        addSourceBtn: '.add-source-button',
        copiedTextOption: 'button.drop-zone-icon-button',
        pasteTextarea: '.copied-text-input-textarea',
        insertBtn: 'button.mat-mdc-unelevated-button',
        sourceItemMoreBtn: '.source-item-more-button',
        menuItem: '[role="menuitem"]'
    },

    /**
     * Finds an element by selector and text content
     */
    findByText: function (selector, text) {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).find(el => el.textContent.trim().includes(text));
    },

    /**
     * Deletes a source by name
     */
    deleteSource: async function (sourceName) {
        console.log(`[NBLM] Intentando eliminar fuente: ${sourceName}`);
        const sourceItems = document.querySelectorAll('.source-item');
        for (const item of sourceItems) {
            if (item.textContent.includes(sourceName)) {
                const moreBtn = item.querySelector(this.selectors.sourceItemMoreBtn);
                if (moreBtn) {
                    moreBtn.click();
                    await new Promise(r => setTimeout(r, 500));
                    const deleteBtn = this.findByText(this.selectors.menuItem, "Quitar fuente");
                    if (deleteBtn) {
                        deleteBtn.click();
                        await new Promise(r => setTimeout(r, 1000));
                        // Confirm deletion if modal appears
                        const confirmBtn = this.findByText('button', 'Quitar');
                        if (confirmBtn) confirmBtn.click();
                        return true;
                    }
                }
            }
        }
        return false;
    },

    /**
     * Uploads text content as a new source
     */
    uploadText: async function (name, content) {
        console.log(`[NBLM] Iniciando carga de fuente: ${name}`);

        const addBtn = document.querySelector(this.selectors.addSourceBtn);
        if (!addBtn) throw new Error("Botón 'Agregar fuente' no encontrado");
        addBtn.click();

        await new Promise(r => setTimeout(r, 1000));
        const copiedOption = this.findByText(this.selectors.copiedTextOption, "Texto copiado");
        if (!copiedOption) throw new Error("Opción 'Texto copiado' no encontrada");
        copiedOption.click();

        await new Promise(r => setTimeout(r, 1000));
        const textarea = document.querySelector(this.selectors.pasteTextarea);
        if (!textarea) throw new Error("Area de texto no encontrada");

        // Inject content
        textarea.value = content;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));

        await new Promise(r => setTimeout(r, 500));
        const insertBtn = this.findByText(this.selectors.insertBtn, "Insertar");
        if (!insertBtn) throw new Error("Botón 'Insertar' no encontrado");
        insertBtn.click();

        await new Promise(r => setTimeout(r, 2000));
        // Note: Renaming requires another flow, but simple upload is done.
        return true;
    }
};

console.log("[NBLM] Library Loaded");
