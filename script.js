// ClinicalTrials.gov API v2 endpoint
const API_BASE_URL = 'https://clinicaltrials.gov/api/v2/studies';

// User location data
let userCoordinates = null;

// Smooth scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// FAQ Toggle
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all FAQs
            faqItems.forEach(faq => faq.classList.remove('active'));

            // Open clicked FAQ if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

// Location functionality
document.getElementById('use-current-location').addEventListener('click', getCurrentLocation);

function getCurrentLocation() {
    const statusDiv = document.getElementById('location-status');

    if (!navigator.geolocation) {
        statusDiv.textContent = 'Geolocation is not supported by your browser';
        statusDiv.className = 'location-status error';
        return;
    }

    statusDiv.textContent = 'Getting your location...';
    statusDiv.className = 'location-status';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            userCoordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Reverse geocode to get address
            try {
                const address = await reverseGeocode(userCoordinates.lat, userCoordinates.lng);
                document.getElementById('user-location').value = address;
                statusDiv.textContent = `✓ Location found: ${address}`;
                statusDiv.className = 'location-status success';
            } catch (error) {
                statusDiv.textContent = `✓ Location found (${userCoordinates.lat.toFixed(2)}, ${userCoordinates.lng.toFixed(2)})`;
                statusDiv.className = 'location-status success';
            }
        },
        (error) => {
            let message = 'Unable to retrieve your location';
            if (error.code === error.PERMISSION_DENIED) {
                message = 'Location permission denied. Please enable location access or enter manually.';
            }
            statusDiv.textContent = message;
            statusDiv.className = 'location-status error';
        }
    );
}

async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
        );
        const data = await response.json();

        if (data.address) {
            const parts = [];
            if (data.address.city) parts.push(data.address.city);
            else if (data.address.town) parts.push(data.address.town);
            else if (data.address.county) parts.push(data.address.county);
            if (data.address.state) parts.push(data.address.state);
            return parts.join(', ') || data.display_name;
        }
        return data.display_name;
    } catch (error) {
        throw error;
    }
}

async function geocodeAddress(address) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Search functionality
document.getElementById('search-btn').addEventListener('click', searchTrials);

async function searchTrials() {
    const patientInfo = document.getElementById('patient-info').value.trim();

    if (!patientInfo) {
        alert('Please describe your condition or symptoms to search for clinical trials.');
        return;
    }

    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';

    try {
        // Get user location if provided
        const locationInput = document.getElementById('user-location').value.trim();
        if (locationInput && !userCoordinates) {
            userCoordinates = await geocodeAddress(locationInput);
            if (userCoordinates) {
                document.getElementById('location-status').textContent = `✓ Location: ${locationInput}`;
                document.getElementById('location-status').className = 'location-status success';
            }
        }

        // Extract key medical terms and conditions from patient input
        const searchQuery = extractSearchTerms(patientInfo);

        // Search ClinicalTrials.gov API
        const trials = await fetchTrialsFromAPI(searchQuery, patientInfo);

        if (trials && trials.length > 0) {
            displayResults(trials);
        } else {
            displayNoResults(searchQuery);
        }
    } catch (error) {
        console.error('Search error:', error);
        displayError(error);
    }
}

function extractSearchTerms(text) {
    // Convert to lowercase for processing
    const lowerText = text.toLowerCase();

    // Extract age if mentioned
    const ageMatch = text.match(/(\d+)[-\s]?year[-\s]?old/i);
    const age = ageMatch ? parseInt(ageMatch[1]) : null;

    // Common medical conditions and their variations
    const conditions = [
        'cancer', 'diabetes', 'heart disease', 'hypertension', 'asthma',
        'copd', 'arthritis', 'alzheimer', 'parkinson', 'stroke',
        'kidney disease', 'liver disease', 'lung cancer', 'breast cancer',
        'colon cancer', 'prostate cancer', 'leukemia', 'lymphoma',
        'melanoma', 'depression', 'anxiety', 'bipolar', 'schizophrenia',
        'multiple sclerosis', 'crohn', 'colitis', 'lupus', 'psoriasis',
        'hepatitis', 'hiv', 'aids', 'tuberculosis', 'pneumonia',
        'sepsis', 'infection', 'obesity', 'thyroid', 'osteoporosis'
    ];

    // Find mentioned conditions
    const foundConditions = conditions.filter(condition =>
        lowerText.includes(condition)
    );

    // Build search query - use first found condition or key terms from text
    let query = '';
    if (foundConditions.length > 0) {
        query = foundConditions[0]; // Use most specific condition found
    } else {
        // Extract potential condition keywords (nouns, medical terms)
        const words = text.split(/\s+/)
            .filter(word => word.length > 4) // Get longer words
            .slice(0, 5); // Take first few meaningful words
        query = words.join(' ');
    }

    return {
        query: query || text.substring(0, 100),
        age: age,
        conditions: foundConditions
    };
}

async function fetchTrialsFromAPI(searchTerms, originalText) {
    try {
        // Check if MD Anderson filter is enabled
        const mdAndersonOnly = document.getElementById('filter-md-anderson').checked;

        // Build API query parameters
        const params = new URLSearchParams({
            'query.cond': searchTerms.query,
            'filter.overallStatus': 'RECRUITING',
            'pageSize': '50', // Increased to get more results for filtering
            'format': 'json'
        });

        // Add MD Anderson filter
        if (mdAndersonOnly) {
            // Search for trials with MD Anderson as location or sponsor
            params.append('query.locn', 'MD Anderson');
        }

        // Add age filter if available
        if (searchTerms.age) {
            // ClinicalTrials.gov uses age in years
            params.append('filter.age', searchTerms.age);
        }

        const url = `${API_BASE_URL}?${params.toString()}`;
        console.log('Fetching from:', url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.studies || data.studies.length === 0) {
            return [];
        }

        // Parse and format the trials
        let trials = data.studies.map(study => parseTrialData(study, originalText));

        // Apply nearby filter if enabled
        const nearbyOnly = document.getElementById('filter-nearby').checked;
        if (nearbyOnly && userCoordinates) {
            trials = trials.filter(trial => trial.distance !== null && trial.distance <= 50);
        }

        return trials;

    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

function parseTrialData(study, patientInfo) {
    const protocolSection = study.protocolSection || {};
    const identificationModule = protocolSection.identificationModule || {};
    const statusModule = protocolSection.statusModule || {};
    const descriptionModule = protocolSection.descriptionModule || {};
    const conditionsModule = protocolSection.conditionsModule || {};
    const designModule = protocolSection.designModule || {};
    const eligibilityModule = protocolSection.eligibilityModule || {};
    const contactsLocationsModule = protocolSection.contactsLocationsModule || {};
    const sponsorCollaboratorsModule = protocolSection.sponsorCollaboratorsModule || {};

    // Extract NCT ID
    const nctId = identificationModule.nctId || 'N/A';

    // Extract title
    const title = identificationModule.officialTitle ||
                  identificationModule.briefTitle ||
                  'No title available';

    // Extract description
    const description = descriptionModule.briefSummary ||
                       descriptionModule.detailedDescription ||
                       'No description available';

    // Clean description (remove excessive whitespace, take first 300 chars)
    const cleanDescription = description.replace(/\s+/g, ' ').trim().substring(0, 400) +
                            (description.length > 400 ? '...' : '');

    // Extract conditions
    const conditions = (conditionsModule.conditions || []).join(', ') || 'Not specified';

    // Extract phase
    const phases = designModule.phases || [];
    const phase = phases.length > 0 ? phases.join(', ') : 'Not specified';

    // Extract status
    const status = statusModule.overallStatus || 'Unknown';

    // Extract age eligibility
    const minAge = eligibilityModule.minimumAge || 'N/A';
    const maxAge = eligibilityModule.maximumAge || 'N/A';

    // Extract locations and calculate distance
    const locations = contactsLocationsModule.locations || [];
    let nearestDistance = null;
    let nearestLocation = null;

    if (userCoordinates && locations.length > 0) {
        // Find nearest location
        locations.forEach(loc => {
            if (loc.geoPoint) {
                const distance = calculateDistance(
                    userCoordinates.lat,
                    userCoordinates.lng,
                    loc.geoPoint.lat,
                    loc.geoPoint.lon
                );

                if (nearestDistance === null || distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestLocation = loc;
                }
            }
        });
    }

    let locationStr;
    let locationDisplay;

    if (nearestLocation) {
        locationStr = `${nearestLocation.city || ''}, ${nearestLocation.state || ''}, ${nearestLocation.country || ''}`.replace(/^,\s*|,\s*$/g, '');
        locationDisplay = nearestDistance
            ? `${locationStr} (${nearestDistance.toFixed(1)} miles away)`
            : locationStr;
    } else if (locations.length > 0) {
        locationStr = `${locations[0].city || ''}, ${locations[0].state || ''}, ${locations[0].country || ''}`.replace(/^,\s*|,\s*$/g, '');
        locationDisplay = locationStr;
    } else {
        locationStr = 'Multiple locations';
        locationDisplay = 'Multiple locations';
    }

    const locationCount = locations.length;
    if (locationCount > 1) {
        locationDisplay += ` (+${locationCount - 1} more)`;
    }

    // Extract sponsor
    const sponsor = sponsorCollaboratorsModule.leadSponsor?.name || 'Not specified';

    // Check if this is from a major cancer center
    const isMDAnderson = sponsor.toLowerCase().includes('m.d. anderson') ||
                        sponsor.toLowerCase().includes('md anderson') ||
                        locations.some(loc =>
                            (loc.facility || '').toLowerCase().includes('md anderson') ||
                            (loc.facility || '').toLowerCase().includes('m.d. anderson')
                        );

    const isMajorCenter = !isMDAnderson && (
        sponsor.toLowerCase().includes('mayo clinic') ||
        sponsor.toLowerCase().includes('memorial sloan') ||
        sponsor.toLowerCase().includes('johns hopkins') ||
        sponsor.toLowerCase().includes('cleveland clinic') ||
        sponsor.toLowerCase().includes('dana-farber') ||
        locations.some(loc => {
            const facility = (loc.facility || '').toLowerCase();
            return facility.includes('mayo') ||
                   facility.includes('sloan') ||
                   facility.includes('hopkins') ||
                   facility.includes('cleveland clinic') ||
                   facility.includes('dana-farber');
        })
    );

    // Calculate match score based on patient info
    const matchScore = calculateMatchScore(
        patientInfo.toLowerCase(),
        conditions.toLowerCase(),
        cleanDescription.toLowerCase(),
        title.toLowerCase()
    );

    return {
        id: nctId,
        title: title,
        description: cleanDescription,
        condition: conditions,
        phase: phase,
        status: status,
        sponsor: sponsor,
        locations: locationDisplay,
        locationCount: locationCount,
        minAge: minAge,
        maxAge: maxAge,
        matchType: matchScore > 3 ? 'eligible' : (matchScore > 1 ? 'possible' : 'unknown'),
        matchScore: matchScore,
        distance: nearestDistance,
        allLocations: locations,
        isMDAnderson: isMDAnderson,
        isMajorCenter: isMajorCenter
    };
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function calculateMatchScore(patientInfo, conditions, description, title) {
    let score = 0;

    // Split patient info into words
    const patientWords = patientInfo.toLowerCase().split(/\s+/)
        .filter(word => word.length > 3); // Filter short words

    // Check conditions
    patientWords.forEach(word => {
        if (conditions.includes(word)) score += 3;
        if (description.includes(word)) score += 1;
        if (title.includes(word)) score += 2;
    });

    return score;
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results');
    const resultsListDiv = document.getElementById('results-list');
    const resultsCountDiv = document.querySelector('.results-count');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';

    // Store for location lookups
    currentTrials = results;

    // Sort by distance if available, otherwise by match score
    if (userCoordinates) {
        results.sort((a, b) => {
            // Prioritize trials with distance data
            if (a.distance !== null && b.distance === null) return -1;
            if (a.distance === null && b.distance !== null) return 1;
            if (a.distance !== null && b.distance !== null) {
                return a.distance - b.distance; // Nearest first
            }
            return b.matchScore - a.matchScore; // Fallback to match score
        });
    } else {
        results.sort((a, b) => b.matchScore - a.matchScore);
    }

    const sortInfo = userCoordinates ? ' (sorted by distance)' : '';
    resultsCountDiv.textContent = `Found ${results.length} active recruiting trial${results.length !== 1 ? 's' : ''}${sortInfo}`;
    resultsListDiv.innerHTML = results.map(trial => createTrialCard(trial)).join('');

    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayNoResults(searchTerms) {
    const resultsContainer = document.getElementById('results');
    const resultsListDiv = document.getElementById('results-list');
    const resultsCountDiv = document.querySelector('.results-count');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';

    resultsListDiv.innerHTML = `
        <div class="info-card">
            <h3>No active recruiting trials found</h3>
            <p>We searched for trials matching "${searchTerms.query}" but didn't find any currently recruiting studies.</p>
            <p><strong>Try these suggestions:</strong></p>
            <ul>
                <li>Use different medical terms (e.g., "breast cancer" instead of "breast tumor")</li>
                <li>Be more general (e.g., "diabetes" instead of "type 2 diabetes with neuropathy")</li>
                <li>Include your primary diagnosis or condition</li>
                <li>Visit <a href="https://clinicaltrials.gov/search?cond=${encodeURIComponent(searchTerms.query)}" target="_blank">ClinicalTrials.gov</a> to browse all trials (including non-recruiting)</li>
            </ul>
        </div>
    `;
    resultsCountDiv.textContent = '';
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayError(error) {
    const resultsContainer = document.getElementById('results');
    const resultsListDiv = document.getElementById('results-list');
    const resultsCountDiv = document.querySelector('.results-count');
    const loadingDiv = document.getElementById('loading');

    loadingDiv.style.display = 'none';

    resultsListDiv.innerHTML = `
        <div class="info-card" style="border-left: 4px solid var(--danger);">
            <h3>Search Error</h3>
            <p>We encountered an error while searching for clinical trials. This might be due to:</p>
            <ul>
                <li>Network connectivity issues</li>
                <li>ClinicalTrials.gov API temporarily unavailable</li>
                <li>Browser blocking the request (try disabling ad blockers)</li>
            </ul>
            <p><strong>What you can do:</strong></p>
            <ul>
                <li>Check your internet connection</li>
                <li>Try again in a few moments</li>
                <li>Visit <a href="https://clinicaltrials.gov" target="_blank">ClinicalTrials.gov</a> directly to search</li>
            </ul>
            <p style="font-size: 0.9em; color: var(--text-light); margin-top: 1rem;">
                Error details: ${error.message}
            </p>
        </div>
    `;
    resultsCountDiv.textContent = '';
    resultsContainer.style.display = 'block';
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function createTrialCard(trial) {
    const matchBadgeClass = trial.matchType === 'eligible' ? 'match-eligible' :
                            trial.matchType === 'possible' ? 'match-unknown' : 'match-unknown';
    const matchBadgeText = trial.matchType === 'eligible' ? 'Strong Match' :
                          trial.matchType === 'possible' ? 'Possible Match' : 'May Be Relevant';

    // Distance badge
    const distanceBadge = trial.distance !== null
        ? `<span class="distance-badge">📍 ${trial.distance.toFixed(1)} miles away</span>`
        : '';

    // Institution badge
    let institutionBadge = '';
    if (trial.isMDAnderson) {
        institutionBadge = '<span class="institution-badge md-anderson">🏥 MD Anderson Cancer Center</span>';
    } else if (trial.isMajorCenter) {
        institutionBadge = '<span class="institution-badge major-center">🏥 Major Cancer Center</span>';
    }

    return `
        <div class="trial-card ${trial.isMDAnderson ? 'featured-trial' : ''}">
            <div class="trial-header">
                <span class="trial-id">${trial.id}</span>
                <div class="trial-badges">
                    ${institutionBadge}
                    ${distanceBadge}
                    <span class="match-badge ${matchBadgeClass}">${matchBadgeText}</span>
                </div>
            </div>

            <h3 class="trial-title">${trial.title}</h3>
            <p class="trial-description">${trial.description}</p>

            <div class="trial-meta">
                <div class="meta-item">
                    <strong>Condition:</strong> ${trial.condition}
                </div>
                <div class="meta-item">
                    <strong>Phase:</strong> ${trial.phase}
                </div>
                <div class="meta-item">
                    <strong>Status:</strong> ${trial.status}
                </div>
                <div class="meta-item">
                    <strong>Age Range:</strong> ${trial.minAge} - ${trial.maxAge}
                </div>
                <div class="meta-item">
                    <strong>Nearest Location:</strong> ${trial.locations}
                </div>
                <div class="meta-item">
                    <strong>Sponsor:</strong> ${trial.sponsor}
                </div>
            </div>

            <div class="trial-actions">
                <a href="https://clinicaltrials.gov/study/${trial.id}"
                   target="_blank"
                   class="btn btn-primary btn-small">
                    View Full Details
                </a>
                <button onclick="showContactInfo('${trial.id}')" class="btn btn-secondary btn-small">
                    Contact Study Team
                </button>
                ${trial.locationCount > 1 ? `<button onclick="showAllLocations('${trial.id}')" class="btn btn-secondary btn-small">View All ${trial.locationCount} Locations</button>` : ''}
            </div>
        </div>
    `;
}

// Store trials data for location lookup
let currentTrials = [];

function showAllLocations(trialId) {
    const trial = currentTrials.find(t => t.id === trialId);
    if (!trial || !trial.allLocations) return;

    let locationsList = trial.allLocations.map((loc, idx) => {
        const locStr = `${loc.facility || 'Facility'}, ${loc.city || ''}, ${loc.state || ''}, ${loc.country || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '');
        let distance = '';
        if (userCoordinates && loc.geoPoint) {
            const dist = calculateDistance(
                userCoordinates.lat,
                userCoordinates.lng,
                loc.geoPoint.lat,
                loc.geoPoint.lon
            );
            distance = ` - ${dist.toFixed(1)} miles`;
        }
        return `${idx + 1}. ${locStr}${distance}`;
    }).join('\n');

    alert(`All locations for ${trialId}:\n\n${locationsList}\n\nClick "View Full Details" for contact information at each location.`);
}

function showContactInfo(trialId) {
    alert(`To contact the study team for ${trialId}:

1. Click "View Full Details" to visit ClinicalTrials.gov
2. Look for the "Contacts and Locations" section
3. Find a location near you
4. Contact the listed study coordinator

They will:
• Answer your questions about the trial
• Determine if you meet eligibility criteria
• Explain the informed consent process
• Schedule a screening visit if appropriate

Remember: Participation is always voluntary and you can withdraw at any time.`);
}

// Enter key to search (Ctrl+Enter)
document.getElementById('patient-info').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        searchTrials();
    }
});
