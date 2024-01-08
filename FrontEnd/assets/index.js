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

////// RECUPERER DONNES /////

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

/// AJOUTER/VIDER TRAVAUX GALERIE  ///////

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

///// AJOUT FILTRES //////

const createFilters = (categories, conteneurParent) => {

    const filter = document.createElement("div")
    filter.classList.add("filter-categories")

    filter.innerHTML =
        `<div class="button selected" id="0"> Tous </div>`
        + categories.map((category) =>
            `<div class="button" id="${category.id}"> ${category.name} </div>`).join("")

    conteneurParent.appendChild(filter)
}

///// FILTRER LES TRAVAUX ///////

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
            modale.style.display = (modale.style.display === 'flex') ? 'none' : 'flex'
        })
    })
    worksToDisplayModal(works)
}

/// FAIRE AFFICHER TRAVAUX DANS MODALE ///

const worksToDisplayModal = (works) => {
    const modaleGallery = document.querySelector('.js-modale-gallery')

    modaleGallery.innerHTML = works.map((work) =>
        `<figure>
            <img src=${work.imageUrl} alt=${work.title}>
            <i class="fa-solid fa-trash-can"></i>
        </figure>`
    ).join("")
}

/// MODIFIER CONTENU DE LA MODALE AU CLIC SUR BTN AJOUTER OU VALIDER ///

    const btnAddPhoto = document.querySelector('.btn-add-photo')
    const modaleContent = document.querySelector('.js-modale-content')

    btnAddPhoto.addEventListener('click', () => {

        modaleContent.innerHTML =
            `<div>
        <i class="fa-solid fa-arrow-left js-modale-return"></i>
        <i class="fa-solid fa-xmark js-modale-trigger"></i>
        </div>

        <h2 class="modale-title">Ajout photo</h2>

        <form action="" enctype="multipart/form-data">

        <div class="form-photo">
            <i class="fa-regular fa-image"></i>
            <label for="photo">+ Ajouter une photo</label>
            <input class="js-photo" type="file" name="photo" id="photo">
            <p> jpg, png : 4mo max </p>
        </div>

        <div class="form-title">
            <label for="titre">Titre</label>
            <input class="js-title" type="text" name="titre" id="titre">
        </div>

        <div class="form-categorie">
            <label for="categorie">Catégorie</label>
            <select class="js-categoryId" name="categorie" id="categorie">
                <option value="" disabled selected hidden></option>
                <option value="1">Objets</option>
                <option value="2">Appartements</option>
                <option value="3">Hôtels & restaurants</option>
            </select>
        </div>

        <hr class="modale-bordure">
        <button class="btn-validate" disabled> Valider </button>
        </form>`
    })


const returnBack = (works) => {
    const arrowReturn = document.querySelector('.js-modale-return')

    arrowReturn.addEventListener('click', () => {
        worksToDisplayModal(works)
    })
}

returnBack()


/// AJOUTER TRAVAUX ///









