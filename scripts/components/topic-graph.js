import { isTopicCompleted } from "../components/progress.js";

class TopicGraph extends HTMLElement {

    async connectedCallback() {
        this.textContent = "Wissensgraph wird geladen …";

        try {
            const password = sessionStorage.getItem("annication-password");

            if (!password) {
                window.location.replace("/password.html");
                return;
            }

            this.graph = await ContentCrypto.loadJSON(
                "/content/graph.enc",
                password
            );

            this.selectedTopicId = null;
            this.selectedCourseId = null;

            this.handleOutsideClick = event => {
                const dropdown = this.querySelector(
                    ".topic-graph-course-dropdown"
                );

                if (!dropdown || dropdown.contains(event.target)) {
                    return;
                }

                const menu = dropdown.querySelector(
                    ".topic-graph-course-menu"
                );

                const trigger = dropdown.querySelector(
                    ".topic-graph-course-trigger"
                );

                menu.hidden = true;
                trigger.setAttribute("aria-expanded", "false");
            };

            document.addEventListener(
                "pointerdown",
                this.handleOutsideClick
            );

            this.handleProgressChange = () => {
                this.updateProgressIndicators();
            };

            window.addEventListener(
                "annication:progress-changed",
                this.handleProgressChange
            );
            this.render();

        } catch (error) {
            console.error(error);
            this.textContent =
                "Der Wissensgraph konnte nicht geladen werden.";
        }
    }

    disconnectedCallback() {
        if (this.handleOutsideClick) {
            document.removeEventListener(
                "pointerdown",
                this.handleOutsideClick
            );
        }
        if (this.handleProgressChange) {
            window.removeEventListener(
                "annication:progress-changed",
                this.handleProgressChange
            );
        }
    }

    getNeighbors(topicId) {
        const neighbors = new Set();

        for (const edge of this.graph.edges) {
            if (edge.source === topicId) {
                neighbors.add(edge.target);
            }

            if (edge.target === topicId) {
                neighbors.add(edge.source);
            }
        }

        return neighbors;
    }

    getVisibleGraph() {
        if (this.selectedTopicId === null) {
            return this.graph;
        }

        const visibleIds = this.getNeighbors(this.selectedTopicId);
        visibleIds.add(this.selectedTopicId);

        return {
            nodes: this.graph.nodes.filter(node =>
                visibleIds.has(node.id)
            ),

            edges: this.graph.edges.filter(edge =>
                visibleIds.has(edge.source) &&
                visibleIds.has(edge.target)
            )
        };
    }

    getSelectedCourseTopicIds() {
        if (this.selectedCourseId === null) {
            return null;
        }

        const course = (this.graph.courses ?? []).find(
            course => course.id === this.selectedCourseId
        );

        return course ? new Set(course.topicIds) : null;
    }

    calculateLayout(graph) {
        const positions = new Map();

        if (this.selectedTopicId !== null) {
            positions.set(this.selectedTopicId, {
                x: 0,
                y: 0
            });

            const neighbors = graph.nodes.filter(node =>
                node.id !== this.selectedTopicId
            );

            const radius = Math.max(
                120,
                neighbors.length * 18
            );

            neighbors.forEach((node, index) => {
                const angle =
                    (2 * Math.PI * index) / neighbors.length;

                positions.set(node.id, {
                    x: radius * Math.cos(angle),
                    y: radius * Math.sin(angle)
                });
            });

            return positions;
        }

        // Gesamtansicht: konzentrische Kreise
        const nodesPerRing = 12;

        graph.nodes.forEach((node, index) => {
            const ring = Math.floor(index / nodesPerRing);
            const indexInRing = index % nodesPerRing;

            const ringSize = Math.min(
                nodesPerRing,
                graph.nodes.length - ring * nodesPerRing
            );

            const radius = 130 + ring * 150;
            const angle =
                (2 * Math.PI * indexInRing) / ringSize;

            positions.set(node.id, {
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle)
            });
        });

        return positions;
    }

    selectTopic(topicId) {
        if (this.selectedTopicId === topicId) {
            window.location.href =
                `/pages/topic.html?id=${encodeURIComponent(topicId)}`;

            return;
        }

        this.selectedTopicId = topicId;
        this.render();
    }

    showAllTopics() {
        this.selectedTopicId = null;
        this.render();
    }

    selectCourse(courseId) {
        this.selectedCourseId = courseId || null;
        this.selectedTopicId = null;

        this.render();
    }

    render() {
        this.innerHTML = "";

        const controls = document.createElement("div");
        controls.className = "topic-graph-controls";

        // ========================================
        // Kurs-Dropdown
        // ========================================

        const courseDropdown = document.createElement("div");
        courseDropdown.className =
            "topic-graph-course-dropdown";

        const courseTrigger = document.createElement("button");
        courseTrigger.type = "button";
        courseTrigger.className =
            "topic-graph-course-trigger";

        courseTrigger.setAttribute(
            "aria-haspopup",
            "true"
        );

        courseTrigger.setAttribute(
            "aria-expanded",
            "false"
        );

        const courseLabel = document.createElement("span");
        courseLabel.className =
            "topic-graph-course-label";

        const courseArrow = document.createElement("span");
        courseArrow.className =
            "topic-graph-course-arrow";

        courseArrow.setAttribute("aria-hidden", "true");

        courseTrigger.append(courseLabel, courseArrow);

        const courseMenu = document.createElement("div");
        courseMenu.className = "topic-graph-course-menu";
        courseMenu.hidden = true;

        const availableCourses = (
            this.graph.courses ?? []
        ).filter(course => course.topicIds.length > 0);

        const courseOptions = [
            {
                id: null,
                title: "Alle Kurse"
            },
            ...availableCourses
        ];

        const selectedCourse = courseOptions.find(
            course => course.id === this.selectedCourseId
        );

        courseLabel.textContent =
            selectedCourse?.title ?? "Alle Kurse";

        const optionButtons = [];

        const closeCourseMenu = () => {
            courseMenu.hidden = true;

            courseTrigger.setAttribute(
                "aria-expanded",
                "false"
            );
        };

        const openCourseMenu = (focusIndex = null) => {
            courseMenu.hidden = false;

            courseTrigger.setAttribute(
                "aria-expanded",
                "true"
            );

            if (focusIndex !== null) {
                optionButtons[focusIndex]?.focus();
            }
        };

        courseTrigger.addEventListener("click", () => {
            if (courseMenu.hidden) {
                openCourseMenu();
            } else {
                closeCourseMenu();
            }
        });

        courseTrigger.addEventListener("keydown", event => {
            if (
                event.key !== "ArrowDown" &&
                event.key !== "ArrowUp"
            ) {
                return;
            }

            event.preventDefault();

            const selectedIndex = courseOptions.findIndex(
                course => course.id === this.selectedCourseId
            );

            if (event.key === "ArrowDown") {
                openCourseMenu(
                    Math.min(
                        selectedIndex + 1,
                        optionButtons.length - 1
                    )
                );
            } else {
                openCourseMenu(
                    Math.max(selectedIndex - 1, 0)
                );
            }
        });

        courseOptions.forEach((course, index) => {
            const option = document.createElement("button");
            option.type = "button";
            option.className =
                "topic-graph-course-option";

            option.textContent = course.title;

            if (course.id === this.selectedCourseId) {
                option.classList.add(
                    "topic-graph-course-option-selected"
                );

                option.setAttribute(
                    "aria-current",
                    "true"
                );
            }

            option.addEventListener("click", () => {
                closeCourseMenu();
                this.selectCourse(course.id);
            });

            option.addEventListener("keydown", event => {
                let nextIndex = null;

                if (event.key === "ArrowDown") {
                    nextIndex =
                        (index + 1) % optionButtons.length;
                }

                if (event.key === "ArrowUp") {
                    nextIndex =
                        (index - 1 + optionButtons.length) %
                        optionButtons.length;
                }

                if (event.key === "Home") {
                    nextIndex = 0;
                }

                if (event.key === "End") {
                    nextIndex = optionButtons.length - 1;
                }

                if (nextIndex !== null) {
                    event.preventDefault();
                    optionButtons[nextIndex].focus();
                }
            });

            optionButtons.push(option);
            courseMenu.appendChild(option);
        });

        courseDropdown.append(
            courseTrigger,
            courseMenu
        );

        courseDropdown.addEventListener(
            "keydown",
            event => {
                if (
                    event.key === "Escape" &&
                    !courseMenu.hidden
                ) {
                    event.preventDefault();
                    closeCourseMenu();
                    courseTrigger.focus();
                }
            }
        );

        courseDropdown.addEventListener(
            "focusout",
            event => {
                if (
                    !courseDropdown.contains(
                        event.relatedTarget
                    )
                ) {
                    closeCourseMenu();
                }
            }
        );

        // ========================================
        // Topic-Suche
        // ========================================

        const search = document.createElement("input");
        search.type = "search";
        search.placeholder = "Thema suchen …";

        search.setAttribute(
            "aria-label",
            "Topic suchen"
        );

        const results = document.createElement("div");
        results.className =
            "topic-graph-search-results";

        search.addEventListener("input", () => {
            results.replaceChildren();

            const query =
                search.value.trim().toLowerCase();

            if (!query) {
                return;
            }

            const matches = this.graph.nodes.filter(
                node =>
                    node.title.toLowerCase().includes(query)
            );

            for (const node of matches) {
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = node.title;

                button.addEventListener("click", () => {
                    this.selectTopic(node.id);
                });

                results.appendChild(button);
            }

            if (matches.length === 0) {
                results.textContent =
                    "Keine Topics gefunden.";
            }
        });

        // ========================================
        // Alle anzeigen
        // ========================================

        const showAllButton = document.createElement("button");
        showAllButton.type = "button";
        showAllButton.textContent = "Alle anzeigen";

        showAllButton.addEventListener("click", () => {
            this.showAllTopics();
        });

        controls.append(
            courseDropdown,
            search,
            showAllButton,
            results
        );

        this.appendChild(controls);

        // ========================================
        // Ausgewähltes Topic
        // ========================================

        if (this.selectedTopicId !== null) {
            const selectedNode = this.graph.nodes.find(
                node => node.id === this.selectedTopicId
            );

            const details = document.createElement("div");
            details.className = "topic-graph-details";

            const title = document.createElement("strong");
            title.textContent = selectedNode.title;

            const topicLink = document.createElement("a");

            topicLink.href =
                `/pages/topic.html?id=${encodeURIComponent(
                    selectedNode.id
                )}`;

            topicLink.textContent = "Topic öffnen →";

            details.append(title, topicLink);
            this.appendChild(details);
        }

        this.renderGraph(this.getVisibleGraph());
    }

    updateProgressIndicators() {
        const nodes = this.querySelectorAll(
            ".topic-graph-node[data-topic-id]"
        );

        for (const node of nodes) {
            const topicId = node.dataset.topicId;
            const completed = isTopicCompleted(topicId);

            node.classList.toggle(
                "topic-graph-node-completed",
                completed
            );

            const title = node.dataset.topicTitle;
            const selected = topicId === this.selectedTopicId;

            node.setAttribute(
                "aria-label",
                `Topic ${title} ${completed ? "abgeschlossen, " : ""}` +
                (selected ? "öffnen" : "auswählen")
            );
        }
    }

    renderGraph(graph) {
        const namespace =
            "http://www.w3.org/2000/svg";

        const createSvgElement = tag =>
            document.createElementNS(namespace, tag);

        const svg = createSvgElement("svg");
        svg.setAttribute("viewBox", "0 0 800 500");
        svg.setAttribute("role", "group");

        svg.setAttribute(
            "aria-label",
            "Interaktiver Wissensgraph"
        );

        const viewport = createSvgElement("g");
        svg.appendChild(viewport);

        const positions = this.calculateLayout(graph);
        const courseTopicIds =
            this.getSelectedCourseTopicIds();

        // ========================================
        // Verbindungen
        // ========================================

        for (const edge of graph.edges) {
            const source = positions.get(edge.source);
            const target = positions.get(edge.target);

            if (!source || !target) {
                continue;
            }

            const line = createSvgElement("line");

            line.setAttribute("x1", source.x);
            line.setAttribute("y1", source.y);
            line.setAttribute("x2", target.x);
            line.setAttribute("y2", target.y);
            line.setAttribute("class", "topic-graph-edge");

            if (
                courseTopicIds !== null &&
                (
                    !courseTopicIds.has(edge.source) ||
                    !courseTopicIds.has(edge.target)
                )
            ) {
                line.classList.add(
                    "topic-graph-edge-dimmed"
                );
            }

            viewport.appendChild(line);
        }

        // ========================================
        // Knoten
        // ========================================

        for (const node of graph.nodes) {
            const position = positions.get(node.id);

            const group = createSvgElement("g");
            group.setAttribute(
                "class",
                "topic-graph-node"
            );

            group.setAttribute("role", "button");
            group.setAttribute("tabindex", "0");

            const isSelected =
                node.id === this.selectedTopicId;

            group.setAttribute(
                "aria-label",
                isSelected
                    ? `Topic ${node.title} öffnen`
                    : `Topic ${node.title} auswählen`
            );

            group.dataset.topicId = node.id;
            group.dataset.topicTitle = node.title;

            if (isTopicCompleted(node.id)) {
                group.classList.add("topic-graph-node-completed");
            }

            if (isSelected) {
                group.classList.add(
                    "topic-graph-node-selected"
                );
            }

            if (
                courseTopicIds !== null &&
                !courseTopicIds.has(node.id)
            ) {
                group.classList.add(
                    "topic-graph-node-dimmed"
                );
            }

            const circle = createSvgElement("circle");
            circle.setAttribute("cx", position.x);
            circle.setAttribute("cy", position.y);
            circle.setAttribute("r", 9);

            const label = createSvgElement("text");
            label.setAttribute("x", position.x + 14);
            label.setAttribute("y", position.y + 4);
            label.textContent = node.title;

            const completedMark = createSvgElement("text");
            completedMark.setAttribute("x", position.x + 7);
            completedMark.setAttribute("y", position.y - 9);
            completedMark.setAttribute(
                "class",
                "topic-graph-completed-mark"
            );
            completedMark.setAttribute("aria-hidden", "true");
            completedMark.textContent = "✓";

            group.append(circle, label, completedMark);

            group.addEventListener("click", () => {
                this.selectTopic(node.id);
            });

            group.addEventListener("keydown", event => {
                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {
                    event.preventDefault();
                    this.selectTopic(node.id);
                }
            });

            viewport.appendChild(group);
        }

        // ========================================
        // Zoom und Verschieben
        // ========================================

        let scale = 1;
        let offsetX = 400;
        let offsetY = 250;

        let dragging = false;
        let hasMoved = false;

        let startX = 0;
        let startY = 0;

        let lastX = 0;
        let lastY = 0;

        const updateTransform = () => {
            viewport.setAttribute(
                "transform",
                `translate(${offsetX} ${offsetY}) scale(${scale})`
            );
        };

        // Graph automatisch einpassen
        if (graph.nodes.length > 0) {
            const coordinates = [...positions.values()];

            const minX = Math.min(
                ...coordinates.map(p => p.x)
            );

            const maxX = Math.max(
                ...coordinates.map(p => p.x)
            );

            const minY = Math.min(
                ...coordinates.map(p => p.y)
            );

            const maxY = Math.max(
                ...coordinates.map(p => p.y)
            );

            const width = Math.max(maxX - minX, 1);
            const height = Math.max(maxY - minY, 1);

            scale = Math.min(
                1,
                650 / width,
                350 / height
            );

            offsetX =
                400 - ((minX + maxX) / 2) * scale;

            offsetY =
                250 - ((minY + maxY) / 2) * scale;
        }

        updateTransform();

        svg.addEventListener("wheel", event => {
            event.preventDefault();

            const factor =
                event.deltaY < 0 ? 1.1 : 0.9;

            scale = Math.max(
                0.2,
                Math.min(5, scale * factor)
            );

            updateTransform();
        }, { passive: false });

        svg.addEventListener("pointerdown", event => {
            if (
                event.target.closest(
                    ".topic-graph-node"
                )
            ) {
                return;
            }

            if (event.button !== 0) {
                return;
            }

            dragging = true;
            hasMoved = false;

            startX = event.clientX;
            startY = event.clientY;

            lastX = event.clientX;
            lastY = event.clientY;

            svg.setPointerCapture(event.pointerId);
        });

        svg.addEventListener("pointermove", event => {
            if (!dragging) {
                return;
            }

            const deltaX =
                event.clientX - lastX;

            const deltaY =
                event.clientY - lastY;

            if (
                Math.hypot(
                    event.clientX - startX,
                    event.clientY - startY
                ) > 3
            ) {
                hasMoved = true;
            }

            const bounds =
                svg.getBoundingClientRect();

            offsetX +=
                deltaX * 800 / bounds.width;

            offsetY +=
                deltaY * 500 / bounds.height;

            lastX = event.clientX;
            lastY = event.clientY;

            updateTransform();
        });

        svg.addEventListener("pointerup", event => {
            if (!dragging) {
                return;
            }

            dragging = false;

            if (
                svg.hasPointerCapture(
                    event.pointerId
                )
            ) {
                svg.releasePointerCapture(
                    event.pointerId
                );
            }

            if (
                !hasMoved &&
                this.selectedTopicId !== null
            ) {
                this.showAllTopics();
            }
        });

        svg.addEventListener(
            "pointercancel",
            event => {
                dragging = false;

                if (
                    svg.hasPointerCapture(
                        event.pointerId
                    )
                ) {
                    svg.releasePointerCapture(
                        event.pointerId
                    );
                }
            }
        );

        this.appendChild(svg);
    }
}

customElements.define("topic-graph", TopicGraph);
