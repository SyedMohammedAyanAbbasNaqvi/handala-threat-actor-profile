/* ==========================================================================
   RISKPROFILER THREAT INTELLIGENCE SYSTEM
   INTERACTIVE APP LOGIC (app.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- Navigation Tabs ---
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    const viewPanels = document.querySelectorAll(".view-panel");
    const mainReportTitle = document.getElementById("main-report-title");

    const tabTitles = {
        dashboard: "Threat-Actor Intelligence Overview",
        attribution: "Attribution Assessment & ACH Matrix",
        workflow: "Operational Attack Workflow",
        mitre: "MITRE ATT&CK Mapping Matrix",
        diamond: "Diamond Model of Intrusion Analysis",
        incidents: "High-Profile Incident Case Studies",
        iocs: "Defanged Indicators of Compromise (IOCs)"
    };

    function switchTab(tabId) {
        // Toggle Nav Items Active State
        navItems.forEach(item => {
            if (item.getAttribute("data-tab") === tabId) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        // Toggle Views Active State
        viewPanels.forEach(panel => {
            if (panel.id === `panel-${tabId}`) {
                panel.classList.add("active");
            } else {
                panel.classList.remove("active");
            }
        });

        // Update Title
        if (tabTitles[tabId]) {
            mainReportTitle.textContent = tabTitles[tabId];
        }

        // Trigger Diamond model SVG redraw if switching to diamond tab
        if (tabId === "diamond") {
            setTimeout(drawDiamondConnections, 100);
        }
    }

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const tabId = item.getAttribute("data-tab");
            switchTab(tabId);
        });
    });

    // --- Print / Export Handler ---
    const exportBtn = document.getElementById("btn-export-pdf");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            window.print();
        });
    }

    // --- Interactive Workflow Scrubber ---
    const scrubber = document.getElementById("video-scrubber");
    const timeBadge = document.getElementById("scrubber-time-badge");
    const frames = document.querySelectorAll(".screen-frame");
    const markers = document.querySelectorAll(".timeline-markers .marker-label");

    const phaseLabels = {
        1: "Phase 1: Access",
        2: "Phase 2: Lateral",
        3: "Phase 3: Exfil",
        4: "Phase 4: Destruct",
        5: "Phase 5: PsyOps"
    };

    function updateWorkflowFrame(frameIndex) {
        // Toggle Frame graphics
        frames.forEach(frame => {
            frame.classList.remove("active");
        });
        const activeFrame = document.getElementById(`sim-frame-${frameIndex}`);
        if (activeFrame) {
            activeFrame.classList.add("active");
        }

        // Toggle Timeline markers active
        markers.forEach(marker => {
            if (parseInt(marker.getAttribute("data-frame")) === frameIndex) {
                marker.classList.add("active");
            } else {
                marker.classList.remove("active");
            }
        });

        // Update Slider Value
        if (scrubber) {
            scrubber.value = frameIndex;
        }

        // Update Time Badge
        if (timeBadge && phaseLabels[frameIndex]) {
            timeBadge.textContent = phaseLabels[frameIndex];
        }
    }

    if (scrubber) {
        scrubber.addEventListener("input", (e) => {
            updateWorkflowFrame(parseInt(e.target.value));
        });
    }

    markers.forEach(marker => {
        marker.addEventListener("click", () => {
            const frameIndex = parseInt(marker.getAttribute("data-frame"));
            updateWorkflowFrame(frameIndex);
        });
    });

    // Initialize first frame view
    updateWorkflowFrame(1);


    // --- ACH Matrix Calculator ---
    const weightSelects = document.querySelectorAll(".weight-select");
    const ratingButtons = document.querySelectorAll(".rating-btn");
    
    // Rating mapping values
    const ratingScores = {
        'C': 0.0,    // Consistent
        'N': 0.0,    // Neutral
        'I': -1.0,   // Inconsistent
        'II': -2.0   // Highly Inconsistent
    };

    function getMatrixRatings() {
        const ratings = {
            h1: {},
            h2: {},
            h3: {}
        };

        const rows = document.querySelectorAll("#ach-matrix-table tbody tr[data-evidence-id]");
        rows.forEach(row => {
            const evId = row.getAttribute("data-evidence-id");
            const weightVal = parseFloat(row.querySelector(".weight-select").value);
            
            // H1
            const h1Btn = row.querySelector("[data-hyp='h1'] .rating-btn.active-c, [data-hyp='h1'] .rating-btn.active-i, [data-hyp='h1'] .rating-btn.active-ii, [data-hyp='h1'] .rating-btn.active-n");
            const h1Rate = h1Btn ? h1Btn.getAttribute("data-rate") : 'N';
            ratings.h1[evId] = { rating: h1Rate, weight: weightVal };

            // H2
            const h2Btn = row.querySelector("[data-hyp='h2'] .rating-btn.active-c, [data-hyp='h2'] .rating-btn.active-i, [data-hyp='h2'] .rating-btn.active-ii, [data-hyp='h2'] .rating-btn.active-n");
            const h2Rate = h2Btn ? h2Btn.getAttribute("data-rate") : 'N';
            ratings.h2[evId] = { rating: h2Rate, weight: weightVal };

            // H3
            const h3Btn = row.querySelector("[data-hyp='h3'] .rating-btn.active-c, [data-hyp='h3'] .rating-btn.active-i, [data-hyp='h3'] .rating-btn.active-ii, [data-hyp='h3'] .rating-btn.active-n");
            const h3Rate = h3Btn ? h3Btn.getAttribute("data-rate") : 'N';
            ratings.h3[evId] = { rating: h3Rate, weight: weightVal };
        });

        return ratings;
    }

    function calculateACH() {
        const ratings = getMatrixRatings();
        const scores = { h1: 0.0, h2: 0.0, h3: 0.0 };

        // H1 Score
        for (const ev in ratings.h1) {
            const scoreVal = ratingScores[ratings.h1[ev].rating] || 0;
            scores.h1 += ratings.h1[ev].weight * scoreVal;
        }

        // H2 Score
        for (const ev in ratings.h2) {
            const scoreVal = ratingScores[ratings.h2[ev].rating] || 0;
            scores.h2 += ratings.h2[ev].weight * scoreVal;
        }

        // H3 Score
        for (const ev in ratings.h3) {
            const scoreVal = ratingScores[ratings.h3[ev].rating] || 0;
            scores.h3 += ratings.h3[ev].weight * scoreVal;
        }

        // Update Score Elements in UI
        const h1El = document.getElementById("ach-score-h1");
        const h2El = document.getElementById("ach-score-h2");
        const h3El = document.getElementById("ach-score-h3");

        if (h1El) h1El.textContent = scores.h1.toFixed(1);
        if (h2El) h2El.textContent = scores.h2.toFixed(1);
        if (h3El) h3El.textContent = scores.h3.toFixed(1);

        // Update CSS classes based on values
        if (h1El) updateScoreColorClass(h1El, scores.h1);
        if (h2El) updateScoreColorClass(h2El, scores.h2);
        if (h3El) updateScoreColorClass(h3El, scores.h3);
    }

    function updateScoreColorClass(element, value) {
        element.classList.remove("positive", "negative", "neutral");
        if (value === 0) {
            element.classList.add("positive"); // Fully consistent
        } else if (value <= -5.0) {
            element.classList.add("negative"); // Highly inconsistent
        } else {
            element.classList.add("neutral"); // Moderately inconsistent
        }
    }

    ratingButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const parentCell = btn.closest(".ach-cell");
            const btnGroup = parentCell.querySelectorAll(".rating-btn");
            const rateVal = btn.getAttribute("data-rate");

            // Reset buttons in cell
            btnGroup.forEach(b => {
                b.classList.remove("active-c", "active-i", "active-ii", "active-n");
            });

            // Set active class
            if (rateVal === 'C') btn.classList.add("active-c");
            else if (rateVal === 'I') btn.classList.add("active-i");
            else if (rateVal === 'II') btn.classList.add("active-ii");
            else btn.classList.add("active-n");

            calculateACH();
        });
    });

    weightSelects.forEach(select => {
        select.addEventListener("change", () => {
            calculateACH();
        });
    });

    // Run initial calculation
    calculateACH();


    // --- Diamond Model Interactive Visualizer ---
    const diamondNodes = document.querySelectorAll(".diamond-node");
    const detailTitle = document.getElementById("diamond-detail-title");
    const detailContent = document.getElementById("diamond-detail-content");

    const diamondNodeData = {
        adversary: {
            title: "Adversary Profile",
            text: `
                <p><strong>Threat Actor Cluster:</strong> Void Manticore (Storm-0842, Banished Kitten)</p>
                <p><strong>State Affiliation:</strong> Iranian Ministry of Intelligence and Security (MOIS).</p>
                <p><strong>Operational Profile:</strong> Void Manticore operates the "Handala" persona as a pro-Palestinian hacktivist front. They coordinate their operations with **Scarred Manticore (Storm-0861)**, an MOIS-linked penetration team. This structural handoff enables professional state-level intrusions to be launched and publicized under the cover of a decentralized hacktivist movement.</p>
            `
        },
        capability: {
            title: "Threat Capabilities",
            text: `
                <p><strong>Destructive Tools:</strong> Custom wipers (BiBi Wiper, Cl Wiper, Hamsa Wiper, No-Justice) designed to overwrite partition tables, delete volume shadow copies, and destroy critical system libraries.</p>
                <p><strong>Cloud System Exploitation:</strong> Bypassing endpoint defenses (AV/EDR) by compromising Global Administrator accounts and misusing Microsoft Intune Remote Wipe APIs to initiate native factory resets across thousands of physical endpoints.</p>
                <p><strong>Reconnaissance & Persistence:</strong> Use of Active Directory reconnaissance tools (ADRecon), credential dumping tools, and Group Policy (GPO) modification for lateral movement.</p>
            `
        },
        infrastructure: {
            title: "Adversary Infrastructure",
            text: `
                <p><strong>Phishing & Malware Nodes:</strong> Typo-squatted domains mimicking official security or restoration services (e.g., <code>crowdstrike[.]com[.]vc</code> for the July 2024 outage campaign).</p>
                <p><strong>Network Tunnels:</strong> Configuration of **NetBird** tunneling client relays to establish outbound C2 pathways and bypass ingress network filters.</p>
                <p><strong>Psychological Channels:</strong> Active Telegram channels (e.g., <code>@Handala_Hack</code>) and underground forums (like DamageLib) to seed doxxed databases and leak confirmations.</p>
            `
        },
        victim: {
            title: "Victim Demographics",
            text: `
                <p><strong>Primary Target Sector:</strong> Israeli government entities, municipal public address systems (kindergartens), telecommunication infrastructure, transport layers, and private technology providers.</p>
                <p><strong>Secondary / Western Targets:</strong> Multinational corporations aligned with Israeli interests (e.g., Stryker Corporation, compromised in March 2026) and Western government figures (e.g., FBI Director Kash Patel).</p>
                <p><strong>Impact Scope:</strong> High-impact reputational damage, operational disruption, and data destruction, typically synchronized with regional geopolitical conflicts.</p>
            `
        }
    };

    function drawDiamondConnections() {
        const svg = document.getElementById("diamond-svg");
        const container = document.getElementById("diamond-model-container");
        if (!svg || !container) return;

        svg.innerHTML = "";

        const nodes = {
            adversary: document.getElementById("node-adversary"),
            capability: document.getElementById("node-capability"),
            infrastructure: document.getElementById("node-infrastructure"),
            victim: document.getElementById("node-victim")
        };

        const containerRect = container.getBoundingClientRect();
        const coords = {};

        // Calculate center coordinates for each node
        for (const key in nodes) {
            if (nodes[key]) {
                const rect = nodes[key].getBoundingClientRect();
                coords[key] = {
                    x: (rect.left - containerRect.left) + (rect.width / 2),
                    y: (rect.top - containerRect.top) + (rect.height / 2),
                    active: nodes[key].classList.contains("active")
                };
            }
        }

        // Helper to draw connection line
        function drawLine(p1, p2, activeHighlight) {
            if (!coords[p1] || !coords[p2]) return;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", coords[p1].x);
            line.setAttribute("y1", coords[p1].y);
            line.setAttribute("x2", coords[p2].x);
            line.setAttribute("y2", coords[p2].y);
            
            if (activeHighlight) {
                line.setAttribute("stroke", "rgba(16, 185, 129, 0.6)");
                line.setAttribute("stroke-width", "2");
            } else {
                line.setAttribute("stroke", "rgba(255, 255, 255, 0.08)");
                line.setAttribute("stroke-width", "1");
            }
            svg.appendChild(line);
        }

        // Core diamond boundaries
        const activeNode = document.querySelector(".diamond-node.active");
        const activeType = activeNode ? activeNode.getAttribute("data-node") : null;

        // Draw connections
        const connections = [
            ["adversary", "capability"],
            ["capability", "victim"],
            ["victim", "infrastructure"],
            ["infrastructure", "adversary"],
            ["adversary", "victim"],
            ["capability", "infrastructure"]
        ];

        connections.forEach(conn => {
            const isHighlighted = (activeType === conn[0] || activeType === conn[1]);
            drawLine(conn[0], conn[1], isHighlighted);
        });
    }

    diamondNodes.forEach(node => {
        node.addEventListener("click", () => {
            // Remove active from all nodes
            diamondNodes.forEach(n => n.classList.remove("active"));
            
            // Set active to clicked node
            node.classList.add("active");
            
            // Update Details
            const nodeType = node.getAttribute("data-node");
            if (diamondNodeData[nodeType]) {
                detailTitle.textContent = diamondNodeData[nodeType].title;
                detailContent.innerHTML = diamondNodeData[nodeType].text;
            }

            // Redraw SVG
            drawDiamondConnections();
        });
    });

    // Listen for resize to adjust lines
    window.addEventListener("resize", drawDiamondConnections);
    
    // Initial draw
    setTimeout(drawDiamondConnections, 200);


    // --- IOC Database & MITRE ATT&CK Search Filters ---
    const iocSearchInput = document.getElementById("ioc-search-input");
    const iocTableRows = document.querySelectorAll("#ioc-database-table tbody tr");

    if (iocSearchInput) {
        iocSearchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            iocTableRows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                row.style.display = textContent.includes(query) ? "" : "none";
            });
        });
    }

    const mitreSearchInput = document.getElementById("mitre-search-input");
    const mitreTableRows = document.querySelectorAll("#mitre-database-table tbody tr");

    if (mitreSearchInput) {
        mitreSearchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            mitreTableRows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                row.style.display = textContent.includes(query) ? "" : "none";
            });
        });
    }


    // --- Animate Gauge On Load ---
    const gaugeFill = document.getElementById("dashboard-gauge-fill");
    if (gaugeFill) {
        setTimeout(() => {
            // 12% Authenticity Score is: -180 + (0.12 * 180) = -158.4deg
            gaugeFill.style.transform = "rotate(-158.4deg)";
        }, 400);
    }
});
