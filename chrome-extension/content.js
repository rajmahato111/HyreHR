// Content script for LinkedIn profile scraping
(function() {
  'use strict';

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractProfile') {
      try {
        const profileData = extractLinkedInProfile();
        sendResponse({ success: true, data: profileData });
      } catch (error) {
        console.error('Error extracting profile:', error);
        sendResponse({ success: false, error: error.message });
      }
    }
    return true; // Keep message channel open for async response
  });

  // Extract LinkedIn profile data
  function extractLinkedInProfile() {
    const data = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      currentTitle: '',
      currentCompany: '',
      location: '',
      linkedinUrl: window.location.href.split('?')[0],
      skills: [],
      experience: [],
      education: []
    };

    // Extract name
    const nameElement = document.querySelector('h1.text-heading-xlarge') || 
                       document.querySelector('.pv-text-details__left-panel h1');
    if (nameElement) {
      const fullName = nameElement.textContent.trim();
      const nameParts = fullName.split(' ');
      data.firstName = nameParts[0] || '';
      data.lastName = nameParts.slice(1).join(' ') || '';
    }

    // Extract current title and company
    const titleElement = document.querySelector('.text-body-medium.break-words') ||
                        document.querySelector('.pv-text-details__left-panel .text-body-medium');
    if (titleElement) {
      data.currentTitle = titleElement.textContent.trim();
    }

    // Extract location
    const locationElement = document.querySelector('.text-body-small.inline.t-black--light.break-words') ||
                           document.querySelector('.pv-text-details__left-panel .text-body-small');
    if (locationElement) {
      data.location = locationElement.textContent.trim();
    }

    // Extract current company from experience section
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
      const firstExperience = experienceSection.closest('section')?.querySelector('ul li');
      if (firstExperience) {
        const companyElement = firstExperience.querySelector('.t-14.t-normal span[aria-hidden="true"]') ||
                              firstExperience.querySelector('.pv-entity__secondary-title');
        if (companyElement) {
          data.currentCompany = companyElement.textContent.trim();
        }
      }
    }

    // Extract skills
    const skillsSection = document.querySelector('#skills');
    if (skillsSection) {
      const skillElements = skillsSection.closest('section')?.querySelectorAll('.pv-skill-category-entity__name') ||
                           skillsSection.closest('section')?.querySelectorAll('[data-field="skill_card_skill_topic"]');
      skillElements?.forEach(skill => {
        const skillText = skill.textContent.trim();
        if (skillText) {
          data.skills.push(skillText);
        }
      });
    }

    // Extract contact info (if available)
    const contactSection = document.querySelector('section.pv-contact-info');
    if (contactSection) {
      // Email
      const emailElement = contactSection.querySelector('a[href^="mailto:"]');
      if (emailElement) {
        data.email = emailElement.textContent.trim();
      }

      // Phone
      const phoneElement = contactSection.querySelector('.pv-contact-info__contact-type.ci-phone');
      if (phoneElement) {
        data.phone = phoneElement.querySelector('.pv-contact-info__contact-link')?.textContent.trim() || '';
      }
    }

    // Extract experience details
    const experienceItems = document.querySelectorAll('#experience ~ * ul li, section[data-section="experience"] ul li');
    experienceItems.forEach((item, index) => {
      if (index < 5) { // Limit to 5 most recent experiences
        const titleEl = item.querySelector('.t-bold span[aria-hidden="true"]') ||
                       item.querySelector('.pv-entity__summary-info h3');
        const companyEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]') ||
                         item.querySelector('.pv-entity__secondary-title');
        const datesEl = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]') ||
                       item.querySelector('.pv-entity__date-range span:nth-child(2)');

        if (titleEl) {
          data.experience.push({
            title: titleEl.textContent.trim(),
            company: companyEl?.textContent.trim() || '',
            dates: datesEl?.textContent.trim() || ''
          });
        }
      }
    });

    // Extract education
    const educationItems = document.querySelectorAll('#education ~ * ul li, section[data-section="education"] ul li');
    educationItems.forEach((item, index) => {
      if (index < 3) { // Limit to 3 most recent education entries
        const schoolEl = item.querySelector('.t-bold span[aria-hidden="true"]') ||
                        item.querySelector('.pv-entity__school-name');
        const degreeEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]') ||
                        item.querySelector('.pv-entity__degree-name');
        const datesEl = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]') ||
                       item.querySelector('.pv-entity__dates span:nth-child(2)');

        if (schoolEl) {
          data.education.push({
            school: schoolEl.textContent.trim(),
            degree: degreeEl?.textContent.trim() || '',
            dates: datesEl?.textContent.trim() || ''
          });
        }
      }
    });

    return data;
  }

  // Add floating button to LinkedIn profiles
  function addFloatingButton() {
    // Only add button on profile pages
    if (!window.location.pathname.includes('/in/')) {
      return;
    }

    // Check if button already exists
    if (document.getElementById('recruiting-platform-btn')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'recruiting-platform-btn';
    button.className = 'recruiting-platform-floating-btn';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L10 17L18 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Save to ATS</span>
    `;

    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });

    document.body.appendChild(button);
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFloatingButton);
  } else {
    addFloatingButton();
  }

  // Re-add button on navigation (LinkedIn is a SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(addFloatingButton, 1000);
    }
  }).observe(document, { subtree: true, childList: true });

})();
