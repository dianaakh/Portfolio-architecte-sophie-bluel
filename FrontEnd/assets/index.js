document.addEventListener("DOMContentLoaded", async () => {
    try {
        const categories = await getCategories()
        const images = await getGallery()
        createFilters(categories, portfolioParent)
        createGallery(images, portfolioParent)
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

/// AJOUX TRAVAUX GALERIE  ///////

const portfolioParent = document.getElementById('portfolio')

const createGallery = (images, portfolioParent) => {
    
    const gallery = document.createElement("div")
    gallery.classList.add("gallery")

    gallery.innerHTML = images.map((img) =>     // Utiliser les données reçues pour créer les balises HTML pour chaque image à l'aide de la méthode map
        `<figure>
         <img src=${img.imageUrl} alt=${img.title}>
         <figcaption>${img.title}</figcaption>
        </figure>`).join("")

    portfolioParent.appendChild(gallery)
}

/// AJOUT FILTRES ///

const createFilters = (categories, portfolioParent) => {

    const filter = document.createElement("div")
    filter.classList.add("filter-categories")

    filter.innerHTML = 
    `<div class="button selected" id="0"> Tous </div>` 
    + categories.map((category) => 
    `<div class="button" id="${category.id}"> ${category.name} </div>`).join("")

    portfolioParent.appendChild(filter)
}
