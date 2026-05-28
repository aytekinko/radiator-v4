document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       MOBILE NAVIGATION DRAWER
       ========================================== */
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    if (menuToggle && mobileDrawer) {
        const toggleMenu = () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileDrawer.setAttribute('aria-hidden', isExpanded);
            
            // Set inline styles or active states if needed
            if (!isExpanded) {
                mobileDrawer.style.transform = 'translateY(0)';
                mobileDrawer.style.opacity = '1';
                mobileDrawer.style.pointerEvents = 'auto';
            } else {
                mobileDrawer.style.transform = '';
                mobileDrawer.style.opacity = '';
                mobileDrawer.style.pointerEvents = '';
            }
        };

        menuToggle.addEventListener('click', toggleMenu);

        // Close drawer when clicking link
        drawerLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileDrawer.setAttribute('aria-hidden', 'true');
                mobileDrawer.style.transform = '';
                mobileDrawer.style.opacity = '';
                mobileDrawer.style.pointerEvents = '';
            });
        });
    }

    /* ==========================================
       INTERACTIVE BEFORE/AFTER SLIDER
       ========================================== */
    const baSlider = document.getElementById('ba-slider');
    const baAfter = document.getElementById('ba-after');
    const baHandle = document.getElementById('ba-handle');
    const baLabelBefore = document.getElementById('ba-label-before');
    const baLabelAfter = document.getElementById('ba-label-after');

    if (baSlider && baAfter && baHandle) {
        let isDragging = false;
        let currentPct = 50;

        const updateSlider = (pct) => {
            pct = Math.max(0, Math.min(100, pct));
            currentPct = pct;
            baAfter.style.clipPath = `inset(0 0 0 ${pct}%)`;
            baAfter.style.webkitClipPath = `inset(0 0 0 ${pct}%)`;
            baHandle.style.left = `${pct}%`;
            baSlider.setAttribute('aria-valuenow', Math.round(pct));

            // Dynamic label opacity based on slider position
            if (baLabelBefore && baLabelAfter) {
                // When pct is small (slider is on the left), "Before" area is small.
                // Fade out Before label. Fully visible at pct >= 45, completely invisible at pct <= 20.
                let beforeOpacity = Math.max(0, Math.min(1, (pct - 20) / 25));
                baLabelBefore.style.opacity = beforeOpacity;
                baLabelBefore.style.visibility = beforeOpacity === 0 ? 'hidden' : 'visible';

                // When pct is large (slider is on the right), "After" area is small.
                // Fade out After label. Fully visible at pct <= 55, completely invisible at pct >= 80.
                let afterOpacity = Math.max(0, Math.min(1, (80 - pct) / 25));
                baLabelAfter.style.opacity = afterOpacity;
                baLabelAfter.style.visibility = afterOpacity === 0 ? 'hidden' : 'visible';
            }
        };

        const getPctFromEvent = (e) => {
            const rect = baSlider.getBoundingClientRect();
            const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            return ((clientX - rect.left) / rect.width) * 100;
        };

        // Keyboard navigation (slider itself is focusable via tabindex="0")
        baSlider.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                updateSlider(currentPct - 5);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                updateSlider(currentPct + 5);
            }
        });

        // Unified Pointer Events (mouse and touch)
        const onPointerDown = (e) => {
            isDragging = true;
            baSlider.setPointerCapture(e.pointerId);
            updateSlider(getPctFromEvent(e));
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            updateSlider(getPctFromEvent(e));
        };

        const onPointerUp = (e) => {
            if (!isDragging) return;
            isDragging = false;
            try {
                baSlider.releasePointerCapture(e.pointerId);
            } catch (err) {
                // Ignore if not supported or not currently captured
            }
        };

        baSlider.addEventListener('pointerdown', onPointerDown);
        baSlider.addEventListener('pointermove', onPointerMove);
        baSlider.addEventListener('pointerup', onPointerUp);
        baSlider.addEventListener('pointercancel', onPointerUp);

        // Initialize at 50%
        updateSlider(50);

        // Keep 50% on resize unless dragging
        window.addEventListener('resize', () => {
            if (!isDragging) {
                updateSlider(50);
            }
        }, { passive: true });
    }

    /* ==========================================
       ENERGY SAVINGS CALCULATOR
       ========================================== */
    const gasSlider = document.getElementById('gas-bill-slider');
    const billDisplay = document.getElementById('bill-display');
    const savingsDisplay = document.getElementById('savings-display');
    const co2Display = document.getElementById('co2-display');
    const boilerDisplay = document.getElementById('boiler-display');

    if (gasSlider) {
        const updateCalculator = () => {
            const billValue = parseInt(gasSlider.value, 10);
            
            // Format gas bill with localized thousand separator (e.g. 1.800)
            billDisplay.textContent = billValue.toLocaleString('nl-NL');

            // Calculate 22% average savings
            const savingsValue = Math.round(billValue * 0.22);
            savingsDisplay.textContent = savingsValue.toLocaleString('nl-NL');

            // Calculate CO2 reduction (approx 0.165 kg per Euro saved)
            const co2Value = Math.round(billValue * 0.165);
            co2Display.textContent = `${co2Value} kg`;

            // Calculate variable boiler efficiency improvement (scales nicely from +15% to +23%)
            // We map min(500) to +15% and max(5000) to +23%
            const minBill = 500;
            const maxBill = 5000;
            const percentageFactor = (billValue - minBill) / (maxBill - minBill);
            const efficiencyValue = Math.round(15 + (percentageFactor * 8));
            boilerDisplay.textContent = `+${efficiencyValue}%`;

            // Update range input progress fill background (custom styling helper)
            const min = gasSlider.min ? parseInt(gasSlider.min) : 500;
            const max = gasSlider.max ? parseInt(gasSlider.max) : 5000;
            const progressPercentage = ((billValue - min) / (max - min)) * 100;
            gasSlider.style.backgroundSize = `${progressPercentage}% 100%`;
        };

        gasSlider.addEventListener('input', updateCalculator);
        // Initialize once on load
        updateCalculator();
    }

    /* ==========================================
       WAITLIST MODAL — OPEN / CLOSE
       ========================================== */
    const waitlistModal = document.getElementById('waitlist-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');

    const openModal = () => {
        if (!waitlistModal) return;
        waitlistModal.setAttribute('aria-hidden', 'false');
        waitlistModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        // Focus first focusable field after transition
        setTimeout(() => {
            const firstInput = waitlistModal.querySelector('input, button');
            if (firstInput) firstInput.focus();
        }, 150);
    };

    const closeModal = () => {
        if (!waitlistModal) return;
        waitlistModal.setAttribute('aria-hidden', 'true');
        waitlistModal.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    // All [data-modal-trigger] buttons open the modal
    modalTriggers.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    // Close on close button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // Close when clicking outside the modal card
    if (waitlistModal) {
        waitlistModal.addEventListener('click', (e) => {
            if (e.target === waitlistModal) closeModal();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && waitlistModal && waitlistModal.classList.contains('is-open')) {
            closeModal();
        }
    });

    /* ==========================================
       WAITLIST MODAL — FORM VALIDATION & SUBMIT
       ========================================== */
    const modalLeadForm = document.getElementById('modal-lead-form');
    const modalFormSuccess = document.getElementById('modal-form-success');
    const modalSuccessEmailDisplay = document.getElementById('modal-success-email-display');
    const modalResetBtn = document.getElementById('modal-reset-btn');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePostcode = (pc) => /^[1-9][0-9]{3}\s?[a-zA-Z]{2}$/.test(pc);

    const showFieldError = (inputEl, errorEl, show) => {
        if (!inputEl) return;
        if (show) {
            inputEl.classList.add('is-invalid');
            inputEl.setAttribute('aria-invalid', 'true');
            if (errorEl) errorEl.style.display = 'block';
        } else {
            inputEl.classList.remove('is-invalid');
            inputEl.setAttribute('aria-invalid', 'false');
            if (errorEl) errorEl.style.display = 'none';
        }
    };

    if (modalLeadForm) {
        const modalEmailEl = document.getElementById('modal-email');
        const modalEmailErr = document.getElementById('modal-email-error');
        const modalPostcodeEl = document.getElementById('modal-postcode');
        const modalPostcodeErr = document.getElementById('modal-postcode-error');
        const modalToestemmingEl = document.getElementById('modal-toestemming');
        const modalToestemmingErr = document.getElementById('modal-toestemming-error');

        // Live validation on blur for required fields
        if (modalEmailEl) {
            modalEmailEl.addEventListener('blur', () => {
                showFieldError(modalEmailEl, modalEmailErr, !validateEmail(modalEmailEl.value.trim()));
            });
        }
        if (modalPostcodeEl) {
            // Postcode auto-format: insert space after 4th digit
            modalPostcodeEl.addEventListener('input', (e) => {
                let val = e.target.value.trim().toUpperCase();
                if (val.length === 6 && !val.includes(' ')) {
                    val = val.substring(0, 4) + ' ' + val.substring(4);
                    modalPostcodeEl.value = val;
                }
            });
            modalPostcodeEl.addEventListener('blur', () => {
                showFieldError(modalPostcodeEl, modalPostcodeErr, !validatePostcode(modalPostcodeEl.value.trim()));
            });
        }
        if (modalToestemmingEl) {
            modalToestemmingEl.addEventListener('change', () => {
                showFieldError(modalToestemmingEl, modalToestemmingErr, !modalToestemmingEl.checked);
            });
        }

        // Form submit
        modalLeadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailValid = validateEmail(modalEmailEl ? modalEmailEl.value.trim() : '');
            const postcodeValid = validatePostcode(modalPostcodeEl ? modalPostcodeEl.value.trim() : '');
            const toestemmingValid = modalToestemmingEl ? modalToestemmingEl.checked : false;

            showFieldError(modalEmailEl, modalEmailErr, !emailValid);
            showFieldError(modalPostcodeEl, modalPostcodeErr, !postcodeValid);
            showFieldError(modalToestemmingEl, modalToestemmingErr, !toestemmingValid);

            if (!emailValid || !postcodeValid || !toestemmingValid) {
                // Focus first invalid field
                if (!emailValid && modalEmailEl) modalEmailEl.focus();
                else if (!postcodeValid && modalPostcodeEl) modalPostcodeEl.focus();
                else if (!toestemmingValid && modalToestemmingEl) modalToestemmingEl.focus();
                return;
            }

            // Loading state
            if (modalSubmitBtn) {
                modalSubmitBtn.disabled = true;
                modalSubmitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Bezig...';
            }

            // Simulate async submit
            setTimeout(() => {
                const emailVal = modalEmailEl ? modalEmailEl.value.trim() : '';
                if (modalSuccessEmailDisplay) modalSuccessEmailDisplay.textContent = emailVal;

                // Show success state, hide form
                if (modalLeadForm) modalLeadForm.style.display = 'none';
                if (modalFormSuccess) {
                    modalFormSuccess.style.display = 'flex';
                    modalFormSuccess.setAttribute('aria-hidden', 'false');
                }

                // Reset submit button for next time
                if (modalSubmitBtn) {
                    modalSubmitBtn.disabled = false;
                    modalSubmitBtn.innerHTML = 'Meld mij aan <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>';
                }
            }, 1000);
        });

        // Reset / close from success state
        if (modalResetBtn) {
            modalResetBtn.addEventListener('click', () => {
                closeModal();
                // Reset form after close animation
                setTimeout(() => {
                    modalLeadForm.reset();
                    modalLeadForm.style.display = '';
                    if (modalFormSuccess) {
                        modalFormSuccess.style.display = 'none';
                        modalFormSuccess.setAttribute('aria-hidden', 'true');
                    }
                    // Clear errors
                    [modalEmailEl, modalPostcodeEl, modalToestemmingEl].forEach(el => {
                        if (el) {
                            el.classList.remove('is-invalid');
                            el.setAttribute('aria-invalid', 'false');
                        }
                    });
                    [modalEmailErr, modalPostcodeErr, modalToestemmingErr].forEach(el => {
                        if (el) el.style.display = 'none';
                    });
                }, 350);
            });
        }
    }

    /* (old lead-form section removed — see waitlist modal above) */

    /* ==========================================
       FAQ ACCORDIONS
       ========================================== */
    const faqTriggers = document.querySelectorAll('.faq-trigger');

    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const content = trigger.nextElementSibling;
            const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
            
            // Close all other accordions first (accordion behavior)
            faqTriggers.forEach(otherTrigger => {
                if (otherTrigger !== trigger) {
                    otherTrigger.setAttribute('aria-expanded', 'false');
                    const otherContent = otherTrigger.nextElementSibling;
                    otherContent.style.maxHeight = null;
                    otherContent.setAttribute('aria-hidden', 'true');
                }
            });

            // Toggle active state
            trigger.setAttribute('aria-expanded', !isExpanded);
            
            if (!isExpanded) {
                // Open: set scrollHeight
                content.style.maxHeight = content.scrollHeight + 'px';
                content.setAttribute('aria-hidden', 'false');
            } else {
                // Close
                content.style.maxHeight = null;
                content.setAttribute('aria-hidden', 'true');
            }
        });
    });

    /* ==========================================
       SCROLL & STICKY ACTIONS
       ========================================== */
    const backToTopBtn = document.getElementById('back-to-top');
    const mobileStickyCtaEl = document.getElementById('mobile-sticky-cta');
    const header = document.querySelector('.app-header');
    const heroSection = document.querySelector('.hero-section');

    const onScroll = () => {
        const scrollY = window.scrollY;

        // Back-to-top visibility
        if (backToTopBtn) {
            if (scrollY > 300) {
                backToTopBtn.classList.add('visible');
                backToTopBtn.setAttribute('tabindex', '0');
            } else {
                backToTopBtn.classList.remove('visible');
                backToTopBtn.setAttribute('tabindex', '-1');
            }
        }

        // Header scroll style
        if (header) {
            header.classList.toggle('header-scrolled', scrollY > 50);
        }

        // Mobile Sticky CTA — show after scrolling past hero
        if (mobileStickyCtaEl) {
            const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 300;
            if (scrollY > heroBottom - 80) {
                mobileStickyCtaEl.classList.add('visible');
                mobileStickyCtaEl.setAttribute('aria-hidden', 'false');
            } else {
                mobileStickyCtaEl.classList.remove('visible');
                mobileStickyCtaEl.setAttribute('aria-hidden', 'true');
            }
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load to set initial states
    onScroll();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});
