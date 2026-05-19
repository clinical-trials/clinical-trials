# Clinical Trials Finder - Patient-Facing Website

A user-friendly website designed to help patients discover and learn about clinical trials that may be relevant to their health conditions.

## Overview

This website addresses a critical challenge in medical research: **80% of clinical trials fail to meet their patient recruitment timelines**. By providing an accessible, patient-friendly interface to search and understand clinical trials, this tool aims to connect patients with research opportunities that could benefit both them and medical science.

## Features

### 🔍 **Smart Trial Matching**
- Enter your health information in plain language
- Intelligent keyword matching finds relevant trials
- Results ranked by relevance to your condition

### 📍 **Location-Based Search**
- Enter your address, city, or zip code
- Or use your current location with one click
- Trials sorted by distance from your location
- See exact distance to nearest trial site
- View all locations for multi-site trials
- Filter to show only trials within 50 miles

### 🏥 **Major Cancer Center Integration**
- **MD Anderson Cancer Center**: All registered trials included and highlighted
- Filter to show ONLY MD Anderson trials
- Visual badges identify trials from MD Anderson and other major centers
- Includes trials from Mayo Clinic, Memorial Sloan Kettering, Johns Hopkins, Dana-Farber, Cleveland Clinic, and 1,000+ other institutions

### 📚 **Educational Resources**
- Clear explanations of clinical trials
- Information about participant rights and safety
- FAQ section addressing common concerns
- Guidance on eligibility criteria

### 💡 **Patient-Friendly Design**
- Simple, intuitive interface
- No medical jargon (or explanations provided)
- Responsive design works on all devices
- Clear calls-to-action

### 🎯 **Trial Information Display**
- Trial ID and title
- Detailed description
- Phase and status
- Age requirements
- Location information
- Direct links to ClinicalTrials.gov

## How It Works

1. **Patient describes their condition**: Users enter their symptoms, diagnosis, and relevant medical history in a text box

2. **Patient enters location (optional)**: 
   - Type in city, state, or zip code
   - Or click "Use Current Location" for automatic detection
   - System geocodes the address to find nearby trials

3. **System matches trials**: The search algorithm:
   - Extracts keywords from patient description
   - Matches against trial criteria and conditions
   - Scores and ranks trials by relevance
   - Filters based on age eligibility
   - Calculates distance to trial locations (if location provided)

4. **Results displayed**: Patients see:
   - Trials sorted by distance (if location provided) or relevance
   - Distance to nearest trial site in miles
   - Match quality indicator
   - Key trial information
   - Links to full details and all locations
   - Contact information

## Technical Implementation

### Files

- **index.html** - Main website structure with semantic HTML5
- **styles.css** - Modern, responsive CSS styling
- **script.js** - Client-side search and matching logic

### Technologies

- Pure HTML5, CSS3, and vanilla JavaScript
- ClinicalTrials.gov API v2 for live trial data
- OpenStreetMap Nominatim API for geocoding
- Geolocation API for current location detection
- Haversine formula for distance calculations
- No dependencies or frameworks required
- Works entirely client-side
- Fully responsive design

### Live Data Integration

**This website now connects to real clinical trial data!**

- **Data Source**: ClinicalTrials.gov API v2 (live data)
- **Updated**: Real-time access to currently recruiting trials
- **Coverage**: 400,000+ registered clinical trials from all major institutions
- **Major Cancer Centers**: Includes ALL trials from MD Anderson, Memorial Sloan Kettering, Mayo Clinic, Johns Hopkins, Dana-Farber, Cleveland Clinic, and more
- **Filters**: 
  - Only show "RECRUITING" status trials
  - Filter by MD Anderson Cancer Center specifically
  - Filter by distance (within 50 miles)
- **Search**: Intelligent keyword extraction matches patient descriptions to trial conditions
- **Special Highlighting**: MD Anderson and other major cancer center trials are visually highlighted

### Supported Conditions

The search works for any medical condition, including:
- All types of cancer (breast, lung, colon, prostate, leukemia, lymphoma, melanoma, etc.)
- Cardiovascular diseases (heart failure, hypertension, coronary artery disease)
- Metabolic disorders (diabetes, obesity, thyroid conditions)
- Neurological conditions (Alzheimer's, Parkinson's, MS, stroke)
- Respiratory diseases (asthma, COPD, pneumonia)
- Autoimmune diseases (lupus, Crohn's, rheumatoid arthritis, psoriasis)
- Mental health (depression, anxiety, bipolar, schizophrenia)
- Infectious diseases (HIV, hepatitis, tuberculosis)
- And hundreds more...

## Research Foundation

The matching algorithm design is based on the TREC Clinical Trials Track (2021-2022):
- **2021 Track**: 75 synthetic patient cases, evaluation by medical professionals
- **2022 Track**: 50 additional cases, same methodology
- **Evaluation Criteria**: Eligible/Excluded/Not Relevant framework
- **Source**: https://www.trec-cds.org/

## Usage

### Local Deployment

**Option 1 - Simple (may have CORS issues with some browsers):**
1. Open `index.html` in any modern web browser
2. If you get CORS errors, use Option 2

**Option 2 - Local server (recommended):**
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```
Then visit: `http://localhost:8000`

**Note**: Some browsers may block API requests when opening HTML files directly due to CORS policies. Using a local server resolves this issue.

### Testing the Search

Try these sample patient descriptions:

**Example 1 - Cancer:**
```
I'm a 52-year-old woman recently diagnosed with stage 2 breast cancer. I've completed surgery and my oncologist is discussing treatment options including chemotherapy and targeted therapy.
```

**Example 2 - Diabetes:**
```
I'm a 45-year-old man with type 2 diabetes. I was diagnosed 3 years ago and am currently taking metformin. My most recent A1C was 7.8% and my doctor suggested we might need to add insulin. I'm interested in new treatment options.
```

**Example 3 - Heart Disease:**
```
I'm a 68-year-old man with heart failure. I have shortness of breath with activity and my ejection fraction is 35%. Currently taking several medications but still having symptoms.
```

**Example 4 - Alzheimer's:**
```
My 73-year-old mother was diagnosed with early-stage Alzheimer's disease last year. She's having memory problems and difficulty with daily activities. We're interested in trials for new treatments.
```

## Key Features for Patients

### Safety & Ethics
- All trials are IRB-approved
- Participation is voluntary
- Right to withdraw anytime
- Privacy protected

### Understanding Eligibility
- **Eligible**: You meet criteria and have no exclusions
- **Excluded**: You qualify but have an excluding condition
- **Insufficient Info**: Need more information to determine

### What Patients Get
- Access to new treatments
- Close medical monitoring
- Contribute to medical research
- Potential free treatment
- Advance medical knowledge

## Future Enhancements

### Short-term
- Connect to live ClinicalTrials.gov API
- Advanced filters (location, phase, condition)
- Save favorite trials
- Email alerts for new matching trials

### Medium-term
- Integration with electronic health records
- AI-powered matching using medical NLP
- Multi-language support
- Mobile app version

### Long-term
- Physician referral system
- Trial enrollment tracking
- Patient community features
- Outcome reporting

## Accessibility

- WCAG 2.1 AA compliant markup
- Semantic HTML for screen readers
- Keyboard navigation support
- High contrast text
- Responsive from 320px to 4K displays

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Privacy & Compliance

- No patient data collected
- No cookies or tracking
- All searches performed locally
- Links to official trial registries
- HIPAA-aware design (no PHI transmitted)

## Disclaimer

This tool is for informational purposes only and does not constitute medical advice. Always consult with your healthcare provider before making decisions about your medical care or participating in clinical trials.

## Data Attribution

- Clinical trial data from ClinicalTrials.gov
- TREC Clinical Trials Track (2021-2022)
- Sample synthetic patient cases created with medical expertise
- Evaluation by Oregon Health and Science University (OHSU)

## Resources

- [ClinicalTrials.gov](https://clinicaltrials.gov)
- [NIH Clinical Research Trials](https://www.nih.gov/health-information/nih-clinical-research-trials-you)
- [FDA Clinical Trials Information](https://www.fda.gov/patients/clinical-trials-what-patients-need-know)
- [TREC Clinical Trials Track](https://www.trec-cds.org/)

## License

Educational and research purposes. Clinical trial data is publicly available from ClinicalTrials.gov.

---

**Note**: This is a demonstration website. In production, integrate with live trial databases and consult with medical and legal professionals to ensure compliance with healthcare regulations.
