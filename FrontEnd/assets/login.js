document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector(".connect")

    form.addEventListener("submit", async (event) => {
        event.preventDefault()
        await login()
    })
})

const login = async () => {

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    const payload = {
        email,
        password
    }

    const res = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (res.ok) {
        // Si la connexion réussit, obtenir le token et le stocker dans le localStorage ainsi que la variable de connexion
        const data = await res.json()
        const userdata = data.token
        window.localStorage.setItem('connected', true)
        window.localStorage.setItem('payload', userdata)

        // Rediriger après connexion réussie
        document.location.href = ("index.html")

    } else {
        // Gérer un échec de connexion
        const messageError = document.createElement("p")
        messageError.classList.add("error")
        messageError.textContent = "Erreur dans l’identifiant ou le mot de passe"

        const btnForm = document.querySelector(".connect")
        btnForm.appendChild(messageError)
    }
}
