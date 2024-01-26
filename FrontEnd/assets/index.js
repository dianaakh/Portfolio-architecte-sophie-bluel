document.addEventListener("DOMContentLoaded", async () => {
    try {
        const categories = await getCategories()
        const works = await getGallery()

        createFilters(categories)
        appendGallery(works) // Pour afficher les œuvres initiales
        filterWorks(works)

        const connected = window.localStorage.getItem('connected')  // Vérifier si l'utilisateur est connecté en consultant les données stockées localement

        if (connected) {

            const editBande = document.querySelector(".header_edit")
            editBande.style.display = "flex"  // Faire afficher la bande noire edition 

            const linkModify = document.querySelector(".modify-content")
            linkModify.style.display = "flex"   // Faire afficher le lien modifier

            openCloseModal(works)
            eventListenersForm()

            // Déconnexion de l'utilisateur en supprimant les informations de connexion
            const btnLogout = document.querySelector('.nav-connexion')
            btnLogout.textContent = "logout"

            btnLogout.addEventListener('click', () => {
                window.localStorage.removeItem('connected')  // Supprimer la clé 'connected' du stockage local indiquant que l'utilisateur n'est plus connecté
                window.localStorage.removeItem('payload')   // Supprimer la clé 'payload' du stockage local qui peut contenir des informations d'authentification
                window.location.reload() // Recharger la page après déconnexion
            })
        }
    } catch (error) {
        console.error(error)
    }
})

/// RECUPERER DONNES 

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

/// AFFICHER/VIDER TRAVAUX GALERIE  

const conteneurParent = document.getElementById('portfolio')  // Conteneur de la gallery et des filtres

const clearGallery = () => {
    const gallery = document.querySelector('.gallery')
    if (gallery) {
        gallery.remove()
    }
}

const appendGallery = (works) => {
    const gallery = document.createElement("div")
    gallery.classList.add("gallery")

   // Utilisation de la méthode map pour parcourir chaque élément du tableau "works" et générer une chaîne de balises HTML représentant chaque œuvre dans la galerie
    gallery.innerHTML = works.map((work) =>  
        `<figure>                               
            <img src=${work.imageUrl} alt=${work.title}>
            <figcaption>${work.title}</figcaption>
        </figure>`
    ).join("")

    conteneurParent.appendChild(gallery)
}

/// AFFICHER FILTRES 

const createFilters = (categories) => {

    const filter = document.createElement("div")
    filter.classList.add("filter-categories")

    filter.innerHTML =
        `<div class="button selected" id="0"> Tous </div>`
        + categories.map((category) =>
            `<div class="button" id="${category.id}"> ${category.name} </div>`).join("")

    conteneurParent.appendChild(filter)
}

/// FILTRER LES TRAVAUX 

const filterWorks = (works) => {
    const btnFilter = document.querySelectorAll(".button")

    btnFilter.forEach((btn, i) => {
        btn.addEventListener("click", () => {
            let worksToDisplay = []

            if (i !== 0) {
                worksToDisplay = works.filter((work) => work.categoryId == i)
            } else {
                worksToDisplay = works
            }

            clearGallery()
            appendGallery(worksToDisplay)

            btnFilter.forEach((btn) => btn.classList.remove("selected"))
            btn.classList.add("selected")
        })
    })
}

/////////////////////////////////////////////// MODALE ///////////////////////////////////////////////////////////////////////////////



const openCloseModal = (works) => {
    const modale = document.getElementById('modale')
    const modaleTriggers = document.querySelectorAll('.js-modale-trigger')

    modaleTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            if (modale.style.display !== 'flex') {
                modale.style.display = 'flex'        // Afficher la modale
                firstModalState()

            } else {
                modale.style.display = 'none'        // Fermer la modale
                resetForm()
            }
        })
    })

    document.addEventListener('click', (event) => {
        if (event.target.closest(".modale-wrapper") === null && event.target.closest(".modify-content") === null ) {
            modale.style.display = 'none' // Fermer la modale
            resetForm()
        }
    })

    displayWorksInModal(works)
    secondModalState(works)
    handlePhotoSelection()
}


/// FAIRE AFFICHER LES TRAVAUX DANS LA MODALE AVEC ICONE POUBELLE

const displayWorksInModal = (works) => {
    const modaleGallery = document.querySelector('.js-modale-gallery')

    modaleGallery.innerHTML = works.map((work) =>
        `<figure>
            <img src=${work.imageUrl} alt=${work.title} data-id=${work.id}>
            <i class="fa-solid fa-trash-can" data-id=${work.id}></i>
        </figure>`
    ).join("")

    eventListenerTrashIcon()
}

/// SUPPRESSION D'UN PROJET EXISTANT

const eventListenerTrashIcon = () => {
    let iconsTrash = document.querySelectorAll('.fa-trash-can')

    for (let i = 0; i < iconsTrash.length; i++) {
        iconsTrash[i].addEventListener('click', function (event) {
            deleteWork(event)
        })
    }
}

const deleteWork = async (event) => {

    // Récupère l'ID du projet à supprimer à partir de l'attribut "data-id" de l'élément déclencheur de l'événement
    let id = event.target.dataset.id
    console.log('ID à supprimer :', id, event)

    try {
        const res = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Accept": "*/*",
                "Authorization": "Bearer " + localStorage.payload,
            },
        })

        if (res.ok) {
            event.target.parentElement.remove()
            const newGallery = await getGallery()
            displayWorksInModal(newGallery)   // Afficher la modale avec les oeuvres mise à jour
            clearGallery()                   // Vider ancienne gallerie dans la page principale
            appendGallery(newGallery)       // Ajouter nouvelle gallerie dans la page principale

        } else if (res.status === 401) {
            alert('Session expirée, merci de vous reconnecter')
            document.location.href = "login.html"
        } else if (res.status === 500) {
            alert('Erreur interne du serveur. Veuillez réessayer plus tard.')
        }

    } catch (error) {
        console.error(error)
    }
}

/// DIFFERENTS ETATS DE LA MODALE 

const firstModalState = () => {
    const firstModal = document.querySelector('.modale-first')
    const secondModal = document.querySelector('.modale-second')

    firstModal.style.display = 'block'
    secondModal.style.display = 'none'
}

const secondModalState = (works) => {

    const btnAddPhoto = document.querySelector('.btn-add-photo')
    const firstModal = document.querySelector('.modale-first')
    const secondModal = document.querySelector('.modale-second')

    btnAddPhoto.addEventListener('click', () => {
        firstModal.style.display = 'none'
        secondModal.style.display = 'block'

        returnBack(works)
        handlePhotoSelection()
    })
}

/// RETOUR EN ARRIERE 

const returnBack = () => {
    const arrowModal = document.querySelector(".js-arrow-second")
    if (arrowModal !== null) {

        arrowModal.addEventListener("click", () => {
            firstModalState()   // Afficher la version initiale de la modale
        })
    }
}

/// FONCTION POUR GERER SELECTION FICHIER ET VALIDER IMAGE 

const inputPhoto = document.getElementById('photo') // élément input photo

const handlePhotoSelection = () => {

    inputPhoto.addEventListener("change", () => {

        const fileExtensionRegex = /\.(jpe?g|png)$/i
        const maxFileSize = 4 * 1024 * 1024  // Taille maximale autorisée : 4 Mo (en octets)

        if (inputPhoto.files.length === 0 || !fileExtensionRegex.test(inputPhoto.files[0].name)) {
            alert("Format non pris en charge ou aucun fichier sélectionné")
            resetForm()
        } else if (inputPhoto.files[0].size > maxFileSize) {
            alert("La taille du fichier dépasse 4 Mo. Veuillez choisir un fichier plus petit.")
            resetForm()
        } else {
            displaySelectedImage(inputPhoto.files[0])  // Afficher miniature image sélectionnée
        }
    })
}

/// FONCTION POUR AFFICHER IMAGE SELECTIONNEE 

const labelPhoto = document.querySelector('.label-photo')

const displaySelectedImage = (file) => {
    const img = document.createElement('img')
    img.classList.add('img-uploaded')
    const url = URL.createObjectURL(file)  // Crée une URL à partir du fichier sélectionné

    img.src = url
    labelPhoto.innerHTML = ""
    labelPhoto.style.width = "0px"
    labelPhoto.appendChild(img)
}

/// FONCTION REINITIALISATION FORMULAIRE 

const formUploadPhoto = document.querySelector('.form-upload-photo')         // formulaire ajout photo
const inputFormTitle = document.getElementById("title")                     // input titre du form     
const selectCategory = document.getElementById('categorie')                 // sélecteur de catégorie du form 

const resetForm = () => {
    formUploadPhoto.innerHTML = `
    <form action="" method="post" enctype="multipart/form-data" class="form-upload-photo">
			<div class="form-photo">
				<i class="fa-regular fa-image"></i>
				<label class='label-photo' for="photo">+ Ajouter une photo</label>
				<input type="file" name="photo" id="photo">
				<p> jpg, png : 4mo max </p>
			</div>

			<div class="form-title">
				<label for="title">Titre</label>
				<input type="text" name="titre" id="title">
			</div>

			<div class="form-categorie">
				<label for="categorie">Catégorie</label>
				<select name="categorie" id="categorie">
                <option class="option-default" value="" selected></option>
                <option class="option" value="1">Objets</option>
                <option class="option" value="2">Appartements</option>
                <option class="option" value="3">Hôtels & restaurants</option>
				</select>
			</div>
            <hr class="modale-bordure">
			<button class="btn-validate"> Valider </button>
	</form>`

    selectCategory.value = ""
    inputFormTitle.value = ""
    inputPhoto.value = ""  // Réinitialiser le champ de sélection de fichier 

    handlePhotoSelection()   // Réattribuer l'événement après la réinitialisation du formulaire
}

/// FONCTION QUI ACTIVE LE BOUTON VERT SI LES CONDITIONS SONT REMPLIES 

const btnValidateForm = () => {
    const btnValidate = document.querySelector('.btn-validate')

    if (inputFormTitle.value !== "" && selectCategory.value !== "" && inputPhoto.files.length > 0) {
        btnValidate.style.background = "#1D6154"
        btnValidate.disabled = false
        btnValidate.style.cursor = "pointer"
    } else {
        btnValidate.disabled = true
        btnValidate.style.background = "#A7A7A7"
        btnValidate.style.cursor = "auto"
    }
}

/// FONCTION QUI AJOUTE LES EVENT LISTENERS LIE AU FORMULAIRE PHOTO 

const eventListenersForm = () => {
    if (inputFormTitle !== null && selectCategory !== null && inputPhoto !== null) {
        inputFormTitle.addEventListener('input', btnValidateForm)
        selectCategory.addEventListener('input', btnValidateForm)
        inputPhoto.addEventListener('change', btnValidateForm)
        formUploadPhoto.addEventListener('submit', addNewWork)   // Ajouter la nouvelle oeuvre à la gallerie au moment de la soumission du form de la modale
    }
}

/// AJOUT PROJET

const addNewWork = async (event) => {
    event.preventDefault()     // empêche le rechargement de la page, permettant ainsi l'exécution de la requête asynchrone (fetch) sans interruption

    const formData = new FormData()
    formData.append("image", inputPhoto.files[0])     // On associe les valeurs aux clefs et on les ajoute au formData
    formData.append('title', inputFormTitle.value)
    formData.append('category', selectCategory.value)

    try {
        const res = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + localStorage.payload,
            },
            body: formData,
        })

        if (res.ok) {
            const newGallery = await getGallery() // Récupérer la nouvelle liste des travaux
            
            // Fermer la modale
            const modale = document.getElementById('modale')
            modale.style.display = 'none'

            // Mettre à jour la galerie principale et celle de la modale avec la nouvelle liste des travaux
            clearGallery()
            appendGallery(newGallery)
            filterWorks(newGallery)
            resetForm()
            displayWorksInModal(newGallery)

        } else {
            const errorText = await res.text() // Récupérer le texte d'erreur

            if (res.status === 400) {
                alert(`Erreur lors de l'ajout du projet : ${errorText}`)
            } else if (res.status === 500) {
                alert(`Erreur interne du serveur. Veuillez réessayer plus tard.`)
            } else if (res.status === 401) {
                alert('Session expirée, merci de vous reconnecter')
                document.location.href = ("login.html")
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du projet :', error)
    }
}
