////// RECUPERER DONNES /////

let listGalerie = []   // Initialisation d'un tableau vide pour stocker les œuvres
let listCategories = []

const getGallery = async () => {
    const res = await fetch("http://localhost:5678/api/works")
    const data = await res.json()  
    console.log(data)
} 

const getCategories = async () => {
    const res = await fetch("http://localhost:5678/api/categories") 
    const data = await res.json()  
    console.log(data)
}

//getWorks().then(() => console.log(listGalerie, listCategories))
getCategories(), getGallery()



/// AJOUX TRAVAUX GALERIE  ///////

const gallery = document.createElement("div")
gallery.classList.add("gallery")
