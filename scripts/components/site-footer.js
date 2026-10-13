class SiteFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="site-footer">
                <p>
                    © annication 2026 ·
                    <a href="/pages/legal-notice.html">Impressum</a> ·
                    <a href="/pages/privacy.html">Datenschutz</a>
                </p>
            </footer>
        `;
    }
}

customElements.define("site-footer", SiteFooter);