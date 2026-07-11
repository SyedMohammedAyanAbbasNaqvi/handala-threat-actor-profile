# Handala Threat Actor Profile & Dashboard

An interactive, single-page threat-intelligence profile on **Handala** (tracked by vendors as Void Manticore, Storm-0842, and Banished Kitten), built to practice structuring and presenting a full actor-profile deliverable: attribution reasoning, attack lifecycle, technique mapping, and IOC tracking.

## What's inside

- **Executive summary & authenticity gauge** — a high-level bottom-line judgment on whether Handala is grassroots hacktivism or a state-linked front
- **Attribution ACH matrix** — an interactive Analysis of Competing Hypotheses table (Grassroots hacktivist vs. Iranian MOIS front vs. third-party false flag), weights and ratings recalculate a live inconsistency score
- **Operational workflow** — a phase-by-phase breakdown of the group's attack lifecycle, covering both malware-based wiping and "living-off-the-cloud" identity-based destruction (e.g., abusing MDM/Intune remote wipe)
- **MITRE ATT&CK mapping** — a searchable/filterable table matching observed behaviors to ATT&CK technique IDs
- **Diamond Model visualizer** — a dynamically-drawn SVG relationship chart (Adversary / Capability / Infrastructure / Victim)
- **Case studies** — write-ups of two widely reported campaigns: the July 2024 phishing-wiper campaign that piggybacked on the CrowdStrike outage, and the March 2026 Microsoft Intune-abuse attack on Stryker Corporation
- **IOC database** — searchable table of defanged indicators

## Sourcing note

This profile synthesizes **public reporting** from vendors including Check Point Research, Microsoft, Palo Alto Networks Unit 42, Trellix, Splunk, and CyberScoop, alongside Stryker's own SEC disclosures. It's a research-and-presentation exercise — organizing and visualizing existing public threat intelligence — rather than original primary-source collection. If you publish or extend this, it's worth linking back to the original vendor write-ups for the underlying attribution and technical claims.

## Tech stack

Vanilla HTML5, CSS3, JavaScript. No frameworks, no dependencies.

## Project structure
