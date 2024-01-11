document.addEventListener("DOMContentLoaded", async () => {
    try {
        const categories = await getCategories()
        const works = await getGallery()
        const conteneurParent = document.getElementById('portfolio')
        createFilters(categories, conteneurParent)
        appendGallery(works, conteneurParent) // Pour afficher les œuvres initiales
        filterWorks(works, conteneurParent)

        const connected = window.localStorage.getItem('connected')

        if (connected) {

            const editBande = document.querySelector(".header_edit")
            editBande.style.display = "flex"  // Faire afficher la bande noire edition 

            const linkModify = document.querySelector(".modify-content")
            linkModify.style.display = "flex"   // Faire afficher le lien modifier

            openCloseModal(works)

            // Déconnexion de l'utilisateur en supprimant les informations de connexion
            const btnLogout = document.querySelector('.nav-connexion')
            btnLogout.textContent = "logout"

            btnLogout.addEventListener('click', () => {
                window.localStorage.removeItem('connected')
                window.localStorage.removeItem('payload')
                window.location.reload(); // Recharger la page après déconnexion
            })
        }
    } catch (error) {
        console.error(error)
    }
})

/// RECUPERER DONNES ///

const getGallery = async () => {
    const res = await fetch("http://localhost:5678/api/works")  // Envoi d'une requête pour récupérer les données des travaux à partir de l'URL spécifiée
    const data = await res.json()  // Attente de la résolution de la promesse de la réponse, puis transformation en un objet JavaScript
    return data     // Affichage des données récupérées
}

const getCategories = async () => {
    const res = await fetch("http://localhost:5678/api/categories")
    const data = await res.json()
    return data
}

/// AJOUTER/VIDER TRAVAUX GALERIE  ///

const clearGallery = (conteneurParent) => {
    const gallery = conteneurParent.querySelector('.gallery')
    if (gallery) {
        gallery.remove()
    }
}

const appendGallery = (works, conteneurParent) => {
    const gallery = document.createElement("div")
    gallery.classList.add("gallery")

    gallery.innerHTML = works.map((work) =>
        `<figure>
            <img src=${work.imageUrl} alt=${work.title}>
            <figcaption>${work.title}</figcaption>
        </figure>`
    ).join("")

    conteneurParent.appendChild(gallery)
}

/// AJOUT FILTRES ///

const createFilters = (categories, conteneurParent) => {

    const filter = document.createElement("div")
    filter.classList.add("filter-categories")

    filter.innerHTML =
        `<div class="button selected" id="0"> Tous </div>`
        + categories.map((category) =>
            `<div class="button" id="${category.id}"> ${category.name} </div>`).join("")

    conteneurParent.appendChild(filter)
}

/// FILTRER LES TRAVAUX ///

const filterWorks = (works, conteneurParent) => {
    let btnFilter = document.querySelectorAll(".button")

    btnFilter.forEach((btn, i) => {
        btn.addEventListener("click", () => {
            let worksToDisplay = []

            if (i !== 0) {
                worksToDisplay = works.filter((work) => work.categoryId == i)
            } else {
                worksToDisplay = works
            }

            clearGallery(conteneurParent)
            appendGallery(worksToDisplay, conteneurParent)

            btnFilter.forEach((btn) => btn.classList.remove("selected"))
            btn.classList.add("selected")
        })
    })
}

/////////////////////////////////////////////// MODALE ///////////////////////////////////////////////////////////////////////////////

/// OUVRIR FERMER MODALE ///

const openCloseModal = (works) => {
    const modale = document.getElementById('modale')
    const modaleTriggers = document.querySelectorAll('.js-modale-trigger')

    modaleTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            if (modale.style.display === 'flex') {
                modale.style.display = 'none'
                resetForm()
            } else {
                modale.style.display = 'flex'   // Afficher modale
                firstModalState()
            }
        })
    })

    displayWorksInModal(works)
    SecondModalState(works)
    handlePhotoSelection()   // Appel de la fonction pour gérer la sélection de fichier
}

/// AFFICHER DIFFERENTS CONTENUS MODALE ///

const displayWorksInModal = (works) => {
    const modaleGallery = document.querySelector('.js-modale-gallery')

    modaleGallery.innerHTML = works.map((work) =>
        `<figure>
            <img src=${work.imageUrl} alt=${work.title}>
            <i class="fa-solid fa-trash-can"></i>
        </figure>`
    ).join("")
}

const firstModalState = () => {
    console.log('firstModalState() a été appelée')
    const firstModal = document.querySelector('.modale-first')
    const secondModal = document.querySelector('.modale-second')

    firstModal.style.display = 'block'
    secondModal.style.display = 'none'
}

const SecondModalState = (works) => {
    console.log('secondModalState() a été appelée')
    const btnAddPhoto = document.querySelector('.btn-add-photo')
    const firstModal = document.querySelector('.modale-first')
    const secondModal = document.querySelector('.modale-second')

    btnAddPhoto.addEventListener('click', () => {
        firstModal.style.display = 'none'
        secondModal.style.display = 'block'

        returnBack(works)
    })
}

/// RETOUR EN ARRIERE ///

const returnBack = () => {
    const arrowModal = document.querySelector(".js-arrow-second")
    if (arrowModal !== null) {

        arrowModal.addEventListener("click", () => {
            firstModalState()   // Afficher la version initiale de la modale
        })
    }
}

/// FONCTION POUR GERER SELECTION FICHIER ET VALIDER IMAGE ///

const handlePhotoSelection = () => {
    const inputPhoto = document.getElementById('photo') // Sélection de l'élément input avec l'ID 'photo'

    inputPhoto.addEventListener("change", () => {

        const file_extension_regex = /\.(jpe?g|png)$/i
        const maxFileSize = 4 * 1024 * 1024  // Taille maximale autorisée : 4 Mo (en octets)

        if (inputPhoto.files.length === 0 || !file_extension_regex.test(inputPhoto.files[0].name)) {
            alert("Format non pris en charge ou aucun fichier sélectionné")
            resetForm()
        } else if (inputPhoto.files[0].size > maxFileSize) {
            alert("La taille du fichier dépasse 4 Mo. Veuillez choisir un fichier plus petit.")
            resetForm()
        } else {
            displaySelectedImage(inputPhoto.files[0])
        }
    })
}


/// FONCTION POUR AFFICHER IMAGE SELECTIONNEE ///

const displaySelectedImage = (file) => {
    const img = document.createElement('img')
    img.classList.add('img-uploaded')
    const url = URL.createObjectURL(file)  // Crée une URL à partir du fichier sélectionné
    const labelPhoto = document.querySelector('.label-photo')

    img.src = url
    labelPhoto.innerHTML = ""
    labelPhoto.appendChild(img)
}


/// FONCTION REINITIALISATION FORMULAIRE ///

const resetForm = () => {
    const formPhoto = document.querySelector('.form-photo')
    const labelPhoto = document.querySelector('.label-photo')
    const inputFormTitle = document.getElementById("title")
    const selectCategories = document.getElementById('categorie')

    formPhoto.innerHTML = `
        <i class="fa-regular fa-image"></i>
        <div class="label-photo">+ Ajouter photo</div>
        <p> jpg, png : 4mo max </p> `

    selectCategories.value = ""
    labelPhoto.value = ""
    inputFormTitle.value = ""
}

/// FONCTION QUI ACTIVE LE BOUTON VERT SI LES CONDITIONS SONT REMPLIES ///

const btnValidateForm = () => {
    const btnValidate = document.querySelector('.btn-validate')
    const selectCategories = document.getElementById('categorie')

    if (inputFormTitle.value !== "" && selectCategories.value !== "" && inputPhoto.files.length > 0) {
        btnValidate.style.background = "#1D6154"
        btnValidate.disabled = false
        btnValidate.style.cursor = "pointer"
    } else {
        btnValidate.disabled = true
        btnValidate.style.background = "#A7A7A7"
        btnValidate.style.cursor = "auto"
    }
}

const selectCategories = document.getElementById('categorie')
const inputFormTitle = document.getElementById("title")
const inputPhoto = document.getElementById('photo')

/// FONCTION QUI AJOUTE LES EVENT LISTENERS LIE AU FORMULAIRE PHOTO ///

const eventListenersForm = () => {
    if (inputFormTitle !== null && selectCategories !== null && inputPhoto !== null) {
        inputFormTitle.addEventListener('input', btnValidateForm)
        selectCategories.addEventListener('input', btnValidateForm)
        inputPhoto.addEventListener('input', btnValidateForm)
        formUploadImg.addEventListener('submit', addProject)
    }
}

eventListenersForm()