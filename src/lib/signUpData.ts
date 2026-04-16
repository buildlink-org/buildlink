//file containing the sign up form data

export const studentProfessionOptions = [
    { label: "Architecture", value: "architecture" },
    { label: "Engineering", value: "engineering" },
    { label: "Interior Design", value: "interior-design" },
    { label: "Project Finance", value: "project-finance" },
    { label: "Quantity Surveying", value: "quantity-surveying" },
    { label: "Project Management", value: "project-management" },
    { label: "Construction, Materials & Supplies", value: "construction-materials-supplies" },
    { label: "Health, Safety & Environment (HSE)", value: "health-safety-environment" },
    { label: "Real Estate Development", value: "real-estate-development" },
    { label: "Urban & Regional Planning", value: "urban-regional-planning" },
    { label: "Technological Solutions", value: "technological-solutions" },
    { label: "Governance & Policy", value: "governance-policy" },
    { label: "Advocacy & Awareness", value: "advocacy-awareness" },
];

export const companyProfessionOptions = [
    { label: "Architecture & Design", value: "architecture-design" },
    { label: "Engineering", value: "engineering" },
    { label: "Construction", value: "construction" },
    { label: "Interior Design & Fit Outs", value: "interior-design-fit-outs" },
    { label: "Project Management", value: "project-management" },
    { label: "Project Finance & Advisory", value: "project-finance-advisory" },
    { label: "Construction Materials & Supplies", value: "construction-materials-supplies" },
    { label: "Health, Safety & Environment (HSE)", value: "health-safety-environment" },
    { label: "Real Estate & Property Development", value: "real-estate-property-development" },
    { label: "Technological Solutions", value: "technological-solutions" },
    { label: "Urban Planning & Policy", value: "urban-planning-policy" },
    { label: "Governance, Regulatory & Advocacy", value: "governance-regulatory-advocacy" },
    { label: "Specialised Consulting", value: "specialised-consulting" },
];

export const studentEducationLevel = [
    "Certificate", "Diploma Level", "Undergraduate level", "Postgraduate level", "Doctorate level"
];

export const companyYearsActive = [
    "0-1", "2-3", "4-7", "8-15", "16+"
];

export const skillsByProfession: Record<string, string[]> = {
    "architecture": [
        "Concept Design", "Schematic Design", "Construction Documentation",
        "BIM Modelling", "CAD Drafting", "3D Visualization", "Model Making",
        "Site Analysis", "Sustainable Design", "Universal Design",
        "Passive Design Strategies", "Construction Detailing",
        "Technical Specifications", "Spatial Planning", "Architectural Research",
        "Client Engagement", "Heritage Conservation", "Landscape Architecture"
    ],
    "engineering": [
        "Structural Analysis", "Load Calculations", "Geotechnical Assessment",
        "Road & Highway Design", "Water Supply Design", "Drainage System Design",
        "Mechanical Systems Design (HVAC)", "Electrical Systems Design",
        "Plumbing Design", "Fire Protection Engineering", "Materials Testing",
        "Infrastructure Planning", "Project Estimation", "Surveying & Mapping",
        "Quality Control Engineering", "Energy Modelling", "Specialized Equipment"
    ],
    "interior-design": [
        "Spatial Planning", "Client Engagement", "Mood Board Development",
        "Material & Finishes Specification", "Lighting Design", "Joinery & Furniture Design",
        "Interior Styling", "3D Interior Visualization", "Concept Design",
        "Interior Detailing", "FF&E Selection"
    ],
    "project-management": [
        "Project Planning", "Budgeting & Cost Control", "Risk Management",
        "Stakeholder Management", "Team Coordination", "Contract Management",
        "Reporting & Documentation", "Quality Control", "Monitoring & Evaluation (M&E)",
        "KPI Development"
    ],
    "quantity-surveying": [
        "Cost Estimation", "Cost Planning", "Bill of Quantities (BQ) Preparation",
        "Measurement & Take-Off", "Tender Documentation", "Tender Analysis",
        "Contract Administration", "Interim Valuations", "Final Accounting",
        "Claims Management", "Variations Management", "Dispute Resolution Support"
    ],
    "project-finance": [
        "Financial Modelling", "Feasibility Studies", "Investment Analysis",
        "Budget Forecasting", "Cash Flow Management", "Cost–Benefit Analysis",
        "Funding Strategy", "Procurement Planning", "Asset Management",
        "Public–Private Partnerships"
    ],
    "health-safety-environment": [
        "HSE Compliance", "Risk Assessment", "Environmental Impact Assessment (EIA)",
        "Safety Audits", "Hazard Identification", "Safety Training",
        "Emergency Response Planning", "Workplace Safety Management",
        "Waste Management", "Fire Safety Procedures"
    ],
    "real-estate-development": [
        "Market Research", "Site Acquisition", "Development Feasibility",
        "Property Valuation", "Sales & Marketing Strategy", "Tenant Management",
        "Facility Management", "Leasing Strategy", "Property Law",
        "Investment Structuring"
    ],
    "urban-regional-planning": [
        "Master Planning", "Land Use Planning", "GIS Mapping",
        "Urban Policy Development", "Community Engagement", "Transport Planning",
        "Environmental Planning", "Urban Design", "Sustainability Planning",
        "Data & Spatial Analysis"
    ],
    "governance-policy": [
        "Policy Development", "Regulatory Compliance", "Standards Interpretation",
        "Public Administration", "Stakeholder Engagement", "Government Liaison",
        "Environmental Policies", "Urban Governance", "Training Programmes"
    ],
    "advocacy-awareness": [
        "Sustainability Advocacy", "Environmental Awareness", "Climate Action Planning",
        "Social Impact Design", "Community Mobilization", "Research & Policy Advocacy",
        "Public Speaking", "Report Writing", "Proposal Development"
    ],
    "construction-materials-supplies": [
        "Construction Supervision", "Site Management", "Project Scheduling",
        "Resource Planning", "Contract Administration", "Bill of Quantities (BQ)",
        "Cost Estimation", "Supply Chain Management", "Vendor Management",
        "Material Procurement", "Equipment Handling", "Construction Quality Assurance",
        "Labour Management", "Tendering & Bidding", "Health & Safety Compliance"
    ],
    "technological-solutions": [
        "UX/UI Design", "Software Development", "SaaS Solution Design",
        "Cloud Collaboration Tools", "AI-assisted Design", "BIM Coordination",
        "GIS Analysis", "Digital Twins", "Smart Building Systems",
        "IoT for Construction", "AR/VR for Design", "Drone Mapping",
        "Laser Scanning", "Data Visualization", "Web/App Design"
    ],
    }

    export const expertiseByProfession: Record<string, string[]> = {
    "architecture-design": [
        "Architectural Design Services", "Concept Development", "Master Planning",
        "Urban Design", "Interior Architecture", "Spatial Planning",
        "3D Visualization & Rendering", "BIM Modelling & Coordination",
        "Technical Documentation", "Feasibility Studies", "Sustainable & Green Design",
        "Conservation & Restoration", "Design–Build Services",
        "Landscape Architecture", "Accessibility & Universal Design"
    ],
    "engineering": [
        "Structural Engineering", "Civil Engineering Design",
        "Mechanical Engineering Services", "Electrical Engineering Services",
        "Plumbing & Drainage Design", "HVAC System Design", "Fire Engineering",
        "Geotechnical Investigations", "Traffic & Transportation Engineering",
        "Water & Wastewater Engineering", "Energy Consulting",
        "Infrastructure Design & Management", "Materials Testing & Quality Control"
    ],
    "construction": [
        "General Contracting", "Design–Build Delivery", "Construction Management",
        "Site Preparation", "Structural Works", "Finishing & Fit-out",
        "Renovation & Refurbishment", "Civil Works Construction",
        "Road & Infrastructure Construction", "Steel Fabrication",
        "Carpentry & Joinery Works", "MEP Installations",
        "Construction Quality Assurance", "Equipment Hire Services", "Labour Supply"
    ],
    "interior-design-fit-outs": [
        "Interior Design Services", "Furniture Design & Fabrication",
        "Custom Joinery", "FF&E Procurement", "Fit-out Contracting",
        "Space Optimization Solutions", "Lighting Design Solutions",
        "Interior Branding", "Exhibition & Retail Design", "Staging & Styling"
    ],
    "project-management": [
        "End-to-End Project Management", "Construction Supervision",
        "Contract Administration", "Scheduling & Programming", "Cost Management",
        "Quantity Surveying", "Quality Assurance & Control", "Procurement Management",
        "Commissioning Management", "Claims & Disputes Resolution",
        "Monitoring & Evaluation (M&E)"
    ],
    "project-finance-advisory": [
        "Financial Modelling", "Project Feasibility Analysis", "Investment Structuring",
        "Public–Private Partnerships", "Capital Raising Support",
        "Funding Strategy Consulting", "Market Research & Insights",
        "Due Diligence Services", "Risk Analysis & Mitigation"
    ],
    "construction-materials-supplies": [
        "Building Materials Supply", "Cement & Aggregates Supply", "Steel & Metal Supply",
        "Timber & Wood Products", "Roofing Materials Supply", "Paints & Finishes Supply",
        "Plumbing Materials Supply", "Electrical Components Supply",
        "Tiles & Sanitary ware Supply", "Hardware & Tools Distribution",
        "Smart Building Products", "Glass & Glazing Products", "Furniture & Décor Supply"
    ],
    "real-estate-property-development": [
        "Property Development", "Real Estate Investment Advisory",
        "Land Acquisition & Due Diligence", "Sales & Marketing of Properties",
        "Property Valuation", "Tenant Management", "Property & Facilities Management",
        "Estate Agency Services", "Real Estate Feasibility Studies",
        "Affordable Housing Development", "Mixed-Use Development"
    ],
    "health-safety-environment": [
        "HSE Consulting", "Environmental Impact Assessments (EIA)",
        "Environmental Audits", "Occupational Safety Training",
        "Workplace Risk Assessments", "Fire Safety Audits",
        "Waste Management Solutions", "Environmental Compliance Advisory",
        "Disaster Preparedness & Response"
    ],
    "urban-planning-policy": [
        "Urban Planning Services", "Regional Development Consulting",
        "GIS & Spatial Mapping Services", "Land Use Planning",
        "Transport & Mobility Planning", "Environmental Planning",
        "Policy Research & Development", "Community Engagement Facilitation",
        "Development Control Advisory"
    ],
    "governance-regulatory-advocacy": [
        "Policy Advocacy", "Standards Development", "Public Awareness Campaigns",
        "Government Liaison Services", "Built Environment Research",
        "Compliance & Regulatory Advisory", "Skills Development & Training",
        "Professional Accreditation", "Community Development Programs"
    ],
    "specialised-consulting": [
        "Quantity Surveying & Cost Consulting", "Sustainability Consulting",
        "LEED/EDGE Certification Support", "Contract Law Advisory",
        "Climate Change Consulting", "Social Impact Assessment",
        "Heritage Conservation Consulting", "Market Intelligence Consulting",
        "Logistics & Supply Chain Consulting", "Brand Management"
    ],
    "technological-solutions": [
        "BIM Consulting", "CAD/BIM Outsourcing", "GIS & Geospatial Services",
        "Smart Building Solutions", "Building Automation Systems",
        "IoT for Construction", "Drone Surveying & Mapping",
        "3D Laser Scanning", "Digital Twins Development", "Software Development",
        "SaaS for Real Estate", "VR/AR Design Solutions",
        "Cloud Collaboration Platforms"
    ],
    }