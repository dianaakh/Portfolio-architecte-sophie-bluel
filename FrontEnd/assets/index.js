document.addEventListener("DOMContentLoaded", async () => {
    try {
        const connected = window.localStorage.getItem('connected')

        if (connected) {
            const btnLogout = document.querySelector('.nav-connexion')
            btnLogout.textContent = "logout"

            btnLogout.addEventListener('click', () => {
                // Déconnexion de l'utilisateur en supprimant les informations de connexion
                window.localStorage.removeItem('connected')
                window.localStorage.removeItem('payload')
                window.location.reload(); // Recharger la page après déconnexion
            })
        }
        const categories = await getCategories()
        const works = await getGallery()
        const conteneurParent = document.getElementById('portfolio')
        createFilters(categories, conteneurParent)
        appendGallery(works, conteneurParent) // Pour afficher les œuvres initiales
        filterWorks(works, conteneurParent)
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
