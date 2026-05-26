# System Diagrams - Blood Stock Management System

This folder contains PlantUML diagrams for the Blood Stock Management System.

## Files

### Use Case Diagrams
1. **use-case-diagram.puml** - Detailed use case diagram with all features
2. **use-case-diagram-simple.puml** - Simplified, more readable version
3. **use-case-diagram-ascii.txt** - Text-based version

### Data Flow Diagrams (DFD)
4. **dfd-context-diagram.puml** - Context diagram (DFD Level 0)
5. **dfd-level-0.puml** - Main processes and data stores
6. **dfd-level-1-donation.puml** - Detailed donation processing flow
7. **dfd-level-1-issuance.puml** - Detailed blood issuance flow
8. **dfd-level-1-inventory.puml** - Detailed inventory management flow
9. **dfd-complete-ascii.txt** - Complete DFD in text format

## How to Render the Diagrams

### Method 1: Online PlantUML Editor (Easiest)
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy the content from the `.puml` file
3. Paste it into the editor
4. The diagram will render automatically
5. Download as PNG, SVG, or PDF

### Method 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open the `.puml` file
3. Press `Alt + D` to preview
4. Right-click and select "Export Current Diagram" to save as image

### Method 3: PlantUML Desktop
1. Download PlantUML JAR from https://plantuml.com/download
2. Install Java if not already installed
3. Run: `java -jar plantuml.jar use-case-diagram.puml`
4. This will generate a PNG file

### Method 4: Online Tools
- **PlantText**: https://www.planttext.com/
- **PlantUML Web Server**: http://www.plantuml.com/plantuml/
- **Gravizo**: http://www.gravizo.com/

## Diagram Overview

### Use Case Diagrams

#### Actors
- **Guest**: Unregistered users who can view public information
- **Donor**: Registered blood donors
- **Staff**: Blood bank staff members
- **Admin**: System administrators with full access

#### Main Use Case Packages
1. **Authentication** - User registration, login, account management
2. **Donor Management** - Donor registration, profile management, search
3. **Donation Management** - Recording and tracking blood donations
4. **Blood Inventory** - Managing blood stock, monitoring expiry
5. **Blood Issuance** - Distributing blood to recipients
6. **Event Management** - Organizing blood donation camps
7. **Certificates** - Generating and managing certificates
8. **User & System Management** - Admin functions, analytics, reports

### Data Flow Diagrams (DFD)

#### DFD Levels
- **Context Diagram (Level 0)**: Shows system boundary and external entities
- **DFD Level 0**: Shows 8 main processes and 8 data stores
- **DFD Level 1**: Detailed breakdown of key processes:
  - Donation Processing (7 sub-processes)
  - Blood Issuance (7 sub-processes)
  - Inventory Management (7 sub-processes)

#### Main Processes
1. **User Authentication & Management** - Login, registration, access control
2. **Donor Management** - Donor registration, eligibility, search
3. **Donation Processing** - Recording donations, creating blood packs
4. **Inventory Management** - Stock tracking, expiry monitoring
5. **Blood Issuance** - Distribution to recipients
6. **Event Management** - Blood donation camps coordination
7. **Certificate Generation** - Donor and volunteer certificates
8. **Reporting & Analytics** - System reports and statistics

#### Data Stores
- D1: Users
- D2: Donors
- D3: Donations
- D4: Blood Packs
- D5: Blood Issues
- D6: Events
- D7: Certificates
- D8: Blood Stock Summary

## Customization

To modify the diagrams:
1. Edit the `.puml` files
2. Follow PlantUML syntax: https://plantuml.com/use-case-diagram
3. Re-render to see changes

## Tips for Best Results

- Use **use-case-diagram-simple.puml** for presentations and reports
- Use **use-case-diagram.puml** for detailed documentation
- Export as **SVG** for scalable, high-quality images
- Export as **PNG** for easy insertion into Word/PDF documents

## Color Coding

- **Light Yellow**: Authentication & Account Management
- **Light Green**: Donor Management
- **Light Blue**: Donation Management
- **Light Coral**: Blood Inventory
- **Light Pink**: Blood Issuance
- **Lavender**: Event Management
- **Light Cyan**: Certificates
- **Wheat**: User & System Management

## For Your Report

### Use Case Diagram
Recommended steps:
1. Render **use-case-diagram-simple.puml** as PNG (high resolution)
2. Insert into your TU BSc CSIT Progress Report Appendix C
3. Add caption: "Figure C.1: Use Case Diagram - Blood Stock Management System"

### Data Flow Diagrams
Recommended steps:
1. Render **dfd-context-diagram.puml** as PNG
   - Caption: "Figure D.1: Context Diagram (DFD Level 0)"
2. Render **dfd-level-0.puml** as PNG
   - Caption: "Figure D.2: Data Flow Diagram Level 0"
3. Render **dfd-level-1-donation.puml** as PNG
   - Caption: "Figure D.3: DFD Level 1 - Donation Processing"
4. Render **dfd-level-1-issuance.puml** as PNG
   - Caption: "Figure D.4: DFD Level 1 - Blood Issuance"
5. Render **dfd-level-1-inventory.puml** as PNG
   - Caption: "Figure D.5: DFD Level 1 - Inventory Management"

Insert all diagrams into Appendix D of your report.
