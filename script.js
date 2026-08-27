/* =========================================================
   মেডিসার্চ রংপুর
   মূল জাভাস্ক্রিপ্ট
========================================================= */

"use strict";


/* =========================================================
   ডেটা
========================================================= */

const doctorsData =
    Array.isArray(doctors) ? doctors : [];

const hospitalsData =
    Array.isArray(hospitals) ? hospitals : [];

const specialtiesData =
    Array.isArray(specialties) ? specialties : [];


/* =========================================================
   STATE
========================================================= */

let doctorSearchTerm = "";
let doctorCategoryFilter = "all";
let doctorLocationFilter = "all";

let hospitalSearchTerm = "";
let hospitalTypeFilter = "all";

let selectedSpecialty = "all";

let doctorsToShow = 6;
let hospitalsToShow = 6;


/* =========================================================
   FAVORITES
========================================================= */

let favorites = [];

try {

    favorites = JSON.parse(
        localStorage.getItem("mediSearchFavorites") || "[]"
    );

    if (!Array.isArray(favorites)) {
        favorites = [];
    }

} catch (error) {

    favorites = [];

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const doctorGrid =
    document.getElementById("doctorGrid");

const hospitalGrid =
    document.getElementById("hospitalGrid");

const specialtyGrid =
    document.getElementById("specialtyGrid");

const doctorSearch =
    document.getElementById("doctorSearch");

const heroSearch =
    document.getElementById("heroSearch");

const heroSearchBtn =
    document.getElementById("heroSearchBtn");

const doctorCategory =
    document.getElementById("doctorCategory");

const doctorLocation =
    document.getElementById("doctorLocation");

const hospitalSearch =
    document.getElementById("hospitalSearch");

const hospitalType =
    document.getElementById("hospitalType");

const doctorCount =
    document.getElementById("doctorCount");

const hospitalCount =
    document.getElementById("hospitalCount");

const specialtyCount =
    document.getElementById("specialtyCount");

const doctorNoResult =
    document.getElementById("doctorNoResult");

const hospitalNoResult =
    document.getElementById("hospitalNoResult");

const loadMoreDoctors =
    document.getElementById("loadMoreDoctors");

const viewAllDoctors =
    document.getElementById("viewAllDoctors");

const viewAllHospitals =
    document.getElementById("viewAllHospitals");

const viewAllSpecialties =
    document.getElementById("viewAllSpecialties");

const resetDoctorSearch =
    document.getElementById("resetDoctorSearch");

const themeBtn =
    document.getElementById("themeBtn");

const menuBtn =
    document.getElementById("menuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");

const mobileClose =
    document.getElementById("mobileClose");

const backToTop =
    document.getElementById("backToTop");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const currentYear =
    document.getElementById("currentYear");


/* =========================================================
   MODAL ELEMENTS
========================================================= */

const doctorModal =
    document.getElementById("doctorModal");

const doctorModalContent =
    document.getElementById("doctorModalContent");

const doctorModalClose =
    document.getElementById("doctorModalClose");

const hospitalModal =
    document.getElementById("hospitalModal");

const hospitalModalContent =
    document.getElementById("hospitalModalContent");

const hospitalModalClose =
    document.getElementById("hospitalModalClose");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    updateStats();

    renderSpecialties();

    populateDoctorCategories();

    renderDoctors();

    renderHospitals();

    setupEvents();

    loadTheme();

    updateCurrentYear();

    setupNavigation();

    setupQuickSearch();

    setupModalEvents();

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    if (doctorCount) {

        doctorCount.textContent =
            doctorsData.length + "+";

    }


    if (hospitalCount) {

        hospitalCount.textContent =
            hospitalsData.length + "+";

    }


    if (specialtyCount) {

        specialtyCount.textContent =
            specialtiesData.length;

    }

}


/* =========================================================
   SPECIALTIES
========================================================= */

function renderSpecialties() {

    if (!specialtyGrid) return;

    specialtyGrid.innerHTML = "";


    specialtiesData.forEach(
        (specialty, index) => {

            const card =
                document.createElement("div");

            card.className =
                "specialty-card";

            card.style.animationDelay =
                `${index * 0.04}s`;

            card.dataset.specialty =
                specialty.name;


            card.innerHTML = `

                <div class="specialty-icon">

                    <i class="${escapeHTML(
                        specialty.icon || "fa-solid fa-stethoscope"
                    )}"></i>

                </div>

                <h3>
                    ${escapeHTML(
                        specialty.name || "চিকিৎসা বিভাগ"
                    )}
                </h3>

            `;


            card.addEventListener(
                "click",
                () => {

                    selectedSpecialty =
                        specialty.name;

                    doctorCategoryFilter =
                        specialty.name;

                    if (doctorCategory) {

                        doctorCategory.value =
                            specialty.name;

                    }

                    doctorsToShow = 6;

                    renderDoctors();

                    scrollToSection("doctors");

                }
            );


            specialtyGrid.appendChild(card);

        }
    );

}


/* =========================================================
   DOCTOR CATEGORY
========================================================= */

function populateDoctorCategories() {

    if (!doctorCategory) return;


    const categories =
        [
            ...new Set(
                doctorsData
                    .map(doctor =>
                        doctor.specialty
                    )
                    .filter(Boolean)
            )
        ];


    doctorCategory.innerHTML = `

        <option value="all">
            সব বিভাগ
        </option>

    `;


    categories.forEach(
        category => {

            const option =
                document.createElement("option");

            option.value =
                category;

            option.textContent =
                category;

            doctorCategory.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   TEXT NORMALIZATION
========================================================= */

function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .trim();

}


/* =========================================================
   DOCTOR FILTER
========================================================= */

function getFilteredDoctors() {

    return doctorsData.filter(
        doctor => {

            const searchText = [

                doctor.name,

                doctor.specialty,

                doctor.category,

                doctor.qualification,

                doctor.hospital,

                doctor.chamber,

                doctor.location,

                doctor.address,

                doctor.visitingHour,

                doctor.visitingTime,

                ...(doctor.services || [])

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !doctorSearchTerm ||
                searchText.includes(
                    normalizeText(
                        doctorSearchTerm
                    )
                );


            /*
                category এবং specialty দুইটাই
                support করবে।
            */

            const doctorCategoryName =
                doctor.category ||
                doctor.specialty ||
                "";


            const matchesCategory =
                doctorCategoryFilter === "all" ||
                doctor.specialty ===
                    doctorCategoryFilter ||
                doctor.category ===
                    doctorCategoryFilter ||
                doctorCategoryName ===
                    doctorCategoryFilter;


            /*
                location-এর মধ্যে
                "মেডিকেল মোড়", "ধাপ",
                "জেল রোড" আছে কি না।
            */

            const locationText =
                normalizeText(
                    doctor.location
                );


            let matchesLocation = true;


            if (
                doctorLocationFilter !== "all"
            ) {

                matchesLocation =
                    locationText.includes(
                        normalizeText(
                            doctorLocationFilter
                        )
                    );

            }


            return (
                matchesSearch &&
                matchesCategory &&
                matchesLocation
            );

        }
    );

}


/* =========================================================
   RENDER DOCTORS
========================================================= */

function renderDoctors() {

    if (!doctorGrid) return;


    const filteredDoctors =
        getFilteredDoctors();


    doctorGrid.innerHTML = "";


    const visibleDoctors =
        filteredDoctors.slice(
            0,
            doctorsToShow
        );


    visibleDoctors.forEach(
        (doctor, index) => {

            doctorGrid.appendChild(
                createDoctorCard(
                    doctor,
                    index
                )
            );

        }
    );


    if (doctorNoResult) {

        doctorNoResult.style.display =
            filteredDoctors.length === 0
                ? "block"
                : "none";

    }


    if (loadMoreDoctors) {

        loadMoreDoctors.style.display =
            visibleDoctors.length <
            filteredDoctors.length
                ? "flex"
                : "none";

    }

}


/* =========================================================
   DOCTOR CARD
========================================================= */

function createDoctorCard(
    doctor,
    index
) {

    const card =
        document.createElement("article");


    card.className =
        "doctor-card";


    card.style.animationDelay =
        `${index * 0.05}s`;


    const isFavorite =
        favorites.includes(
            doctor.id
        );


    const verifiedHTML =
        doctor.verified
            ? `

                <span class="verified">

                    <i class="fa-solid fa-circle-check"></i>

                    যাচাইকৃত

                </span>

              `
            : "";


    const services =
        (doctor.services || [])
            .slice(0, 3)
            .map(
                service => `

                    <span class="service-tag">

                        ${escapeHTML(
                            service
                        )}

                    </span>

                `
            )
            .join("");


    /*
       data.js-এ visitingHour এবং
       visitingTime দুইটাই support করবে।
    */

    const visitingTime =
        doctor.visitingHour ||
        doctor.visitingTime ||
        "সময় জানতে ফোন করুন";


    const phone =
        doctor.phone ||
        doctor.appointment ||
        "";


    card.innerHTML = `

        <button
            class="favorite-btn ${
                isFavorite ? "active" : ""
            }"
            data-favorite="${escapeHTML(
                doctor.id
            )}"
            title="পছন্দের তালিকায় যোগ করুন"
            aria-label="পছন্দের তালিকায় যোগ করুন"
        >

            <i class="${
                isFavorite
                    ? "fa-solid"
                    : "fa-regular"
            } fa-heart"></i>

        </button>


        <div class="doctor-top">

            <div class="doctor-avatar">

                <i class="fa-solid fa-user-doctor"></i>

            </div>


            <div class="doctor-info">

                <h3>

                    ${escapeHTML(
                        doctor.name
                    )}

                </h3>


                <div class="doctor-specialty">

                    ${escapeHTML(
                        doctor.specialty ||
                        doctor.category ||
                        "বিশেষজ্ঞ ডাক্তার"
                    )}

                </div>


                ${verifiedHTML}

            </div>

        </div>


        <div class="doctor-details">


            <div class="doctor-detail">

                <i class="fa-solid fa-graduation-cap"></i>

                <span>

                    ${escapeHTML(
                        doctor.qualification ||
                        "তথ্য নেই"
                    )}

                </span>

            </div>


            <div class="doctor-detail">

                <i class="fa-solid fa-hospital"></i>

                <span>

                    ${escapeHTML(
                        doctor.hospital ||
                        "তথ্য নেই"
                    )}

                </span>

            </div>


            <div class="doctor-detail">

                <i class="fa-solid fa-location-dot"></i>

                <span>

                    ${escapeHTML(
                        doctor.location ||
                        "তথ্য নেই"
                    )}

                </span>

            </div>


            <div class="doctor-detail">

                <i class="fa-regular fa-clock"></i>

                <span>

                    ${escapeHTML(
                        visitingTime
                    )}

                </span>

            </div>


            <div class="hospital-services">

                ${services}

            </div>


        </div>


        <div class="doctor-actions">


            <button
                class="btn btn-outline details-btn"
                data-doctor="${escapeHTML(
                    doctor.id
                )}"
            >

                <i class="fa-solid fa-eye"></i>

                বিস্তারিত

            </button>


            <a
                class="btn btn-primary"
                href="tel:${escapeHTML(
                    phone
                )}"
            >

                <i class="fa-solid fa-phone"></i>

                কল করুন

            </a>


        </div>

    `;


    const favoriteButton =
        card.querySelector(
            "[data-favorite]"
        );


    favoriteButton?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleFavorite(
                doctor.id
            );

        }
    );


    const detailsButton =
        card.querySelector(
            ".details-btn"
        );


    detailsButton?.addEventListener(
        "click",
        () => {

            openDoctorModal(
                doctor.id
            );

        }
    );


    return card;

}


/* =========================================================
   DOCTOR MODAL
========================================================= */

function openDoctorModal(id) {

    const doctor =
        doctorsData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!doctor) return;


    const services =
        (doctor.services || [])
            .map(
                service => `

                    <span class="modal-tag">

                        ${escapeHTML(
                            service
                        )}

                    </span>

                `
            )
            .join("");


    const visitingTime =
        doctor.visitingHour ||
        doctor.visitingTime ||
        "সময় জানতে ফোন করুন";


    const phone =
        doctor.phone ||
        doctor.appointment ||
        "";


    const appointment =
        doctor.appointment ||
        doctor.phone ||
        "";


    doctorModalContent.innerHTML = `

        <div class="modal-profile">


            <div class="modal-avatar">

                <i class="fa-solid fa-user-doctor"></i>

            </div>


            <div>

                <h2>

                    ${escapeHTML(
                        doctor.name
                    )}

                </h2>


                <p>

                    ${escapeHTML(
                        doctor.specialty ||
                        doctor.category ||
                        "বিশেষজ্ঞ ডাক্তার"
                    )}

                </p>

            </div>

        </div>


        <div class="modal-info">


            ${modalInfo(
                "যোগ্যতা",
                doctor.qualification,
                "fa-graduation-cap"
            )}


            ${modalInfo(
                "অভিজ্ঞতা",
                doctor.experience,
                "fa-briefcase"
            )}


            ${modalInfo(
                "চেম্বার",
                doctor.chamber,
                "fa-location-dot"
            )}


            ${modalInfo(
                "হাসপাতাল",
                doctor.hospital,
                "fa-hospital"
            )}


            ${modalInfo(
                "ঠিকানা",
                doctor.location,
                "fa-map-pin"
            )}


            ${modalInfo(
                "সাক্ষাতের সময়",
                visitingTime,
                "fa-clock"
            )}


            ${modalInfo(
                "বন্ধের দিন",
                doctor.offDay,
                "fa-calendar-xmark"
            )}


            ${modalInfo(
                "অ্যাপয়েন্টমেন্ট নম্বর",
                appointment,
                "fa-calendar-check"
            )}

        </div>


        <h3 class="modal-section-title">

            চিকিৎসার ক্ষেত্র

        </h3>


        <div class="modal-tags">

            ${
                services ||
                `
                    <span class="modal-tag">
                        তথ্য নেই
                    </span>
                `
            }

        </div>


        <div class="modal-actions">


            <a
                href="tel:${escapeHTML(
                    phone
                )}"
                class="modal-action call"
            >

                <i class="fa-solid fa-phone"></i>

                কল করুন

            </a>


            <a
                href="tel:${escapeHTML(
                    appointment
                )}"
                class="modal-action map"
            >

                <i class="fa-solid fa-calendar-check"></i>

                অ্যাপয়েন্টমেন্ট

            </a>

        </div>

    `;


    openModal(
        doctorModal
    );

}


/* =========================================================
   MODAL INFO
========================================================= */

function modalInfo(
    label,
    value,
    icon
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "";

    }


    return `

        <div class="modal-info-item">

            <span>

                <i class="fa-solid ${icon}"></i>

                ${escapeHTML(
                    label
                )}

            </span>


            <strong>

                ${escapeHTML(
                    value
                )}

            </strong>

        </div>

    `;

}


/* =========================================================
   HOSPITAL FILTER
========================================================= */

function getFilteredHospitals() {

    return hospitalsData.filter(
        hospital => {

            const searchText = [

                hospital.name,

                hospital.type,

                hospital.location,

                hospital.address,

                hospital.phone,

                hospital.appointment,

                ...(hospital.services || [])

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !hospitalSearchTerm ||
                searchText.includes(
                    normalizeText(
                        hospitalSearchTerm
                    )
                );


            /*
               data.js-এ type ইংরেজি হলে
               সেটাও কিছু common বাংলা
               category-এর সাথে মিলবে।
            */

            const type =
                normalizeText(
                    hospital.type
                );


            let matchesType = true;


            if (
                hospitalTypeFilter !== "all"
            ) {

                const selected =
                    normalizeText(
                        hospitalTypeFilter
                    );


                const government =
                    type.includes(
                        "government"
                    ) ||
                    type.includes(
                        "সরকারি"
                    );


                const privateHospital =
                    (
                        type.includes(
                            "private"
                        ) &&
                        type.includes(
                            "hospital"
                        )
                    ) ||
                    type.includes(
                        "বেসরকারি"
                    );


                const diagnostic =
                    type.includes(
                        "diagnostic"
                    ) ||
                    type.includes(
                        "ডায়াগনস্টিক"
                    ) ||
                    type.includes(
                        "ডায়াগনস্টিক"
                    );


                if (
                    selected.includes(
                        "সরকারি"
                    )
                ) {

                    matchesType =
                        government;

                } else if (
                    selected.includes(
                        "বেসরকারি"
                    )
                ) {

                    matchesType =
                        privateHospital;

                } else if (
                    selected.includes(
                        "ডায়াগনস্টিক"
                    ) ||
                    selected.includes(
                        "ডায়াগনস্টিক"
                    )
                ) {

                    matchesType =
                        diagnostic;

                } else {

                    matchesType =
                        type.includes(
                            selected
                        );

                }

            }


            return (
                matchesSearch &&
                matchesType
            );

        }
    );

}


/* =========================================================
   RENDER HOSPITALS
========================================================= */

function renderHospitals() {

    if (!hospitalGrid) return;


    const filteredHospitals =
        getFilteredHospitals();


    hospitalGrid.innerHTML = "";


    const visibleHospitals =
        filteredHospitals.slice(
            0,
            hospitalsToShow
        );


    visibleHospitals.forEach(
        (hospital, index) => {

            hospitalGrid.appendChild(
                createHospitalCard(
                    hospital,
                    index
                )
            );

        }
    );


    if (hospitalNoResult) {

        hospitalNoResult.style.display =
            filteredHospitals.length === 0
                ? "block"
                : "none";

    }

}


/* =========================================================
   HOSPITAL CARD
========================================================= */

function createHospitalCard(
    hospital,
    index
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "hospital-card";


    card.style.animationDelay =
        `${index * 0.05}s`;


    const services =
        (hospital.services || [])
            .slice(0, 4)
            .map(
                service => `

                    <span class="service-tag">

                        ${escapeHTML(
                            service
                        )}

                    </span>

                `
            )
            .join("");


    const phone =
        hospital.phone ||
        hospital.appointment ||
        "";


    const openText =
        hospital.open ||
        hospital.openingHours ||
        "সময় জানতে ফোন করুন";


    card.innerHTML = `

        <div class="hospital-cover">

            <i class="fa-solid fa-hospital"></i>

        </div>


        <div class="hospital-body">


            <span class="hospital-type">

                ${escapeHTML(
                    getHospitalTypeBangla(
                        hospital.type
                    )
                )}

            </span>


            <h3>

                ${escapeHTML(
                    hospital.name
                )}

            </h3>


            <div class="hospital-detail">

                <i class="fa-solid fa-location-dot"></i>

                <span>

                    ${escapeHTML(
                        hospital.address ||
                        hospital.location ||
                        "ঠিকানা পাওয়া যায়নি"
                    )}

                </span>

            </div>


            <div class="hospital-detail">

                <i class="fa-solid fa-clock"></i>

                <span>

                    ${escapeHTML(
                        openText
                    )}

                </span>

            </div>


            <div class="hospital-services">

                ${services}

            </div>


            <div class="hospital-actions">


                <button
                    class="btn btn-outline hospital-details-btn"
                    data-hospital="${escapeHTML(
                        hospital.id
                    )}"
                >

                    <i class="fa-solid fa-eye"></i>

                    বিস্তারিত

                </button>


                <a
                    href="tel:${escapeHTML(
                        phone
                    )}"
                    class="btn btn-primary"
                >

                    <i class="fa-solid fa-phone"></i>

                    কল

                </a>


            </div>

        </div>

    `;


    card.querySelector(
        ".hospital-details-btn"
    )?.addEventListener(
        "click",
        () => {

            openHospitalModal(
                hospital.id
            );

        }
    );


    return card;

}


/* =========================================================
   HOSPITAL TYPE BANGLA
========================================================= */

function getHospitalTypeBangla(type) {

    const value =
        normalizeText(type);


    if (
        value.includes("government") ||
        value.includes("সরকারি")
    ) {

        return "সরকারি হাসপাতাল";

    }


    if (
        value.includes("private") &&
        value.includes("hospital")
    ) {

        return "বেসরকারি হাসপাতাল";

    }


    if (
        value.includes("diagnostic") ||
        value.includes("ডায়াগনস্টিক") ||
        value.includes("ডায়াগনস্টিক")
    ) {

        return "ডায়াগনস্টিক সেন্টার";

    }


    if (
        value.includes("hospital") ||
        value.includes("হাসপাতাল")
    ) {

        return "হাসপাতাল";

    }


    return type || "স্বাস্থ্যসেবা কেন্দ্র";

}


/* =========================================================
   HOSPITAL MODAL
========================================================= */

function openHospitalModal(id) {

    const hospital =
        hospitalsData.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!hospital) return;


    const services =
        (hospital.services || [])
            .map(
                service => `

                    <span class="modal-tag">

                        ${escapeHTML(
                            service
                        )}

                    </span>

                `
            )
            .join("");


    const phone =
        hospital.phone ||
        hospital.appointment ||
        "";


    const appointment =
        hospital.appointment ||
        hospital.phone ||
        "";


    const mapURL =
        hospital.map ||
        createGoogleMapURL(
            hospital.address ||
            hospital.location ||
            hospital.name
        );


    const openText =
        hospital.open ||
        hospital.openingHours ||
        "সময় জানতে ফোন করুন";


    hospitalModalContent.innerHTML = `

        <div class="modal-profile">


            <div class="modal-avatar">

                <i class="fa-solid fa-hospital"></i>

            </div>


            <div>

                <h2>

                    ${escapeHTML(
                        hospital.name
                    )}

                </h2>


                <p>

                    ${escapeHTML(
                        getHospitalTypeBangla(
                            hospital.type
                        )
                    )}

                </p>

            </div>

        </div>


        <div class="modal-info">


            ${modalInfo(
                "ঠিকানা",
                hospital.address,
                "fa-location-dot"
            )}


            ${modalInfo(
                "এলাকা",
                hospital.location,
                "fa-map-pin"
            )}


            ${modalInfo(
                "ফোন নম্বর",
                hospital.phone,
                "fa-phone"
            )}


            ${modalInfo(
                "অ্যাপয়েন্টমেন্ট",
                appointment,
                "fa-calendar-check"
            )}


            ${modalInfo(
                "খোলার সময়",
                openText,
                "fa-clock"
            )}


            ${modalInfo(
                "জরুরি নম্বর",
                hospital.emergency,
                "fa-truck-medical"
            )}

        </div>


        <h3 class="modal-section-title">

            সেবাসমূহ

        </h3>


        <div class="modal-tags">

            ${
                services ||
                `
                    <span class="modal-tag">
                        তথ্য নেই
                    </span>
                `
            }

        </div>


        <div class="modal-actions">


            <a
                href="tel:${escapeHTML(
                    phone
                )}"
                class="modal-action call"
            >

                <i class="fa-solid fa-phone"></i>

                কল করুন

            </a>


            <a
                href="${escapeHTML(
                    mapURL
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="modal-action map"
            >

                <i class="fa-solid fa-location-dot"></i>

                লোকেশন দেখুন

            </a>

        </div>

    `;


    openModal(
        hospitalModal
    );

}


/* =========================================================
   GOOGLE MAPS
========================================================= */

function createGoogleMapURL(location) {

    return (
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
            location || "রংপুর বাংলাদেশ"
        )
    );

}


/* =========================================================
   MODAL OPEN
========================================================= */

function openModal(modal) {

    if (!modal) return;


    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   MODAL CLOSE
========================================================= */

function closeModal(modal) {

    if (!modal) return;


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   MODAL EVENTS
========================================================= */

function setupModalEvents() {

    doctorModalClose?.addEventListener(
        "click",
        () => {

            closeModal(
                doctorModal
            );

        }
    );


    hospitalModalClose?.addEventListener(
        "click",
        () => {

            closeModal(
                hospitalModal
            );

        }
    );


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            overlay => {

                overlay.addEventListener(
                    "click",
                    () => {

                        closeModal(
                            doctorModal
                        );

                        closeModal(
                            hospitalModal
                        );

                    }
                );

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeModal(
                    doctorModal
                );

                closeModal(
                    hospitalModal
                );

            }

        }
    );

}


/* =========================================================
   FAVORITES
========================================================= */

function toggleFavorite(id) {

    const index =
        favorites.indexOf(id);


    if (index === -1) {

        favorites.push(id);

        showToast(
            "ডাক্তারটি পছন্দের তালিকায় যোগ হয়েছে"
        );

    } else {

        favorites.splice(
            index,
            1
        );

        showToast(
            "ডাক্তারটি পছন্দের তালিকা থেকে সরানো হয়েছে"
        );

    }


    localStorage.setItem(
        "mediSearchFavorites",
        JSON.stringify(
            favorites
        )
    );


    renderDoctors();

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /* ডাক্তার সার্চ */

    doctorSearch?.addEventListener(
        "input",
        event => {

            doctorSearchTerm =
                event.target.value.trim();

            doctorsToShow = 6;

            renderDoctors();

        }
    );


    /* ডাক্তার বিভাগ */

    doctorCategory?.addEventListener(
        "change",
        event => {

            doctorCategoryFilter =
                event.target.value;

            selectedSpecialty =
                event.target.value;

            doctorsToShow = 6;

            renderDoctors();

        }
    );


    /* ডাক্তার এলাকা */

    doctorLocation?.addEventListener(
        "change",
        event => {

            doctorLocationFilter =
                event.target.value;

            doctorsToShow = 6;

            renderDoctors();

        }
    );


    /* হাসপাতাল সার্চ */

    hospitalSearch?.addEventListener(
        "input",
        event => {

            hospitalSearchTerm =
                event.target.value.trim();

            renderHospitals();

        }
    );


    /* হাসপাতাল ধরন */

    hospitalType?.addEventListener(
        "change",
        event => {

            hospitalTypeFilter =
                event.target.value;

            renderHospitals();

        }
    );


    /* Hero Search */

    heroSearchBtn?.addEventListener(
        "click",
        performHeroSearch
    );


    heroSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                performHeroSearch();

            }

        }
    );


    /* আরো ডাক্তার */

    loadMoreDoctors?.addEventListener(
        "click",
        () => {

            doctorsToShow += 6;

            renderDoctors();

        }
    );


    /* সব ডাক্তার */

    viewAllDoctors?.addEventListener(
        "click",
        () => {

            resetDoctorFilters();

            doctorsToShow =
                doctorsData.length;

            renderDoctors();

            scrollToSection(
                "doctors"
            );

        }
    );


    /* সব হাসপাতাল */

    viewAllHospitals?.addEventListener(
        "click",
        () => {

            hospitalSearchTerm = "";

            hospitalTypeFilter =
                "all";

            hospitalsToShow =
                hospitalsData.length;

            if (hospitalSearch) {

                hospitalSearch.value =
                    "";

            }

            if (hospitalType) {

                hospitalType.value =
                    "all";

            }

            renderHospitals();

            scrollToSection(
                "hospitals"
            );

        }
    );


    /* সব বিভাগ */

    viewAllSpecialties?.addEventListener(
        "click",
        () => {

            renderSpecialties();

            scrollToSection(
                "specialties"
            );

            showToast(
                "সব চিকিৎসা বিভাগ দেখানো হয়েছে"
            );

        }
    );


    /* রিসেট */

    resetDoctorSearch?.addEventListener(
        "click",
        () => {

            resetDoctorFilters();

            renderDoctors();

            showToast(
                "ডাক্তারের সার্চ রিসেট হয়েছে"
            );

        }
    );


    /* থিম */

    themeBtn?.addEventListener(
        "click",
        toggleTheme
    );


    /* মোবাইল মেনু */

    menuBtn?.addEventListener(
        "click",
        () => {

            mobileMenu?.classList.add(
                "active"
            );

        }
    );


    mobileClose?.addEventListener(
        "click",
        () => {

            mobileMenu?.classList.remove(
                "active"
            );

        }
    );


    /* Back To Top */

    backToTop?.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    /* Privacy */

    document.getElementById(
        "privacyBtn"
    )?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            showToast(
                "গোপনীয়তা নীতি পেজটি পরবর্তীতে যুক্ত করা হবে"
            );

        }
    );


    /* Terms */

    document.getElementById(
        "termsBtn"
    )?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            showToast(
                "শর্তাবলি পেজটি পরবর্তীতে যুক্ত করা হবে"
            );

        }
    );

}


/* =========================================================
   HERO SEARCH
========================================================= */

function performHeroSearch() {

    const value =
        heroSearch?.value.trim() || "";


    doctorSearchTerm =
        value;


    if (doctorSearch) {

        doctorSearch.value =
            value;

    }


    doctorsToShow = 6;


    renderDoctors();


    scrollToSection(
        "doctors"
    );

}


/* =========================================================
   QUICK SEARCH
========================================================= */

function setupQuickSearch() {

    document
        .querySelectorAll(
            ".quick-search button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const category =
                            button.dataset.category;


                        /*
                           যদি exact specialty না মেলে,
                           তাহলে search হিসেবে ব্যবহার করবে।
                        */

                        const exact =
                            doctorsData.some(
                                doctor =>
                                    doctor.specialty ===
                                        category ||
                                    doctor.category ===
                                        category
                            );


                        if (exact) {

                            doctorCategoryFilter =
                                category;

                            doctorSearchTerm =
                                "";

                            if (doctorSearch) {

                                doctorSearch.value =
                                    "";

                            }

                            if (doctorCategory) {

                                doctorCategory.value =
                                    category;

                            }

                        } else {

                            doctorCategoryFilter =
                                "all";

                            doctorSearchTerm =
                                category;

                            if (doctorSearch) {

                                doctorSearch.value =
                                    category;

                            }

                            if (doctorCategory) {

                                doctorCategory.value =
                                    "all";

                            }

                        }


                        doctorsToShow = 6;

                        renderDoctors();

                        scrollToSection(
                            "doctors"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   RESET DOCTOR FILTERS
========================================================= */

function resetDoctorFilters() {

    doctorSearchTerm =
        "";

    doctorCategoryFilter =
        "all";

    doctorLocationFilter =
        "all";

    selectedSpecialty =
        "all";


    doctorsToShow =
        6;


    if (doctorSearch) {

        doctorSearch.value =
            "";

    }


    if (doctorCategory) {

        doctorCategory.value =
            "all";

    }


    if (doctorLocation) {

        doctorLocation.value =
            "all";

    }

}


/* =========================================================
   THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const dark =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "mediSearchTheme",
        dark
            ? "dark"
            : "light"
    );


    updateThemeIcon();

}


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "mediSearchTheme"
        );


    if (
        savedTheme === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }


    updateThemeIcon();

}


function updateThemeIcon() {

    if (!themeBtn) return;


    const icon =
        themeBtn.querySelector(
            "i"
        );


    if (!icon) return;


    const dark =
        document.body.classList.contains(
            "dark-mode"
        );


    icon.className =
        dark
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";


    themeBtn.title =
        dark
            ? "লাইট মোড চালু করুন"
            : "ডার্ক মোড চালু করুন";

}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupNavigation() {

    mobileMenu
        ?.querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        mobileMenu.classList.remove(
                            "active"
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".nav-link"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        link.classList.add(
                            "active"
                        );

                    }
                );

            }
        );


    document
        .getElementById(
            "logoBtn"
        )
        ?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

}


/* =========================================================
   BACK TO TOP
========================================================= */

window.addEventListener(
    "scroll",
    () => {

        if (!backToTop) return;


        if (
            window.scrollY > 500
        ) {

            backToTop.classList.add(
                "show"
            );

        } else {

            backToTop.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   CURRENT YEAR
========================================================= */

function updateCurrentYear() {

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    if (
        !toast ||
        !toastMessage
    ) return;


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   SCROLL
========================================================= */

function scrollToSection(id) {

    document
        .getElementById(id)
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   শেষ
========================================================= */