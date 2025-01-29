// 🟢 Initialisation de la liste des émojis par défaut
const defaultEmojis = [
  "🍓", "🍕", "🍔", "🌵", "🐱", "🐟", "🎸", "🎨", "📱", "🚗",
  "🍦", "🥑", "🦄", "🌙", "🔥", "🎶", "💻", "🐻", "🍩", "🏀",
  "🌈", "🍿", "🥂", "🍹", "🎁", "🏞️", "🚀", "🎧", "👑", "⚽",
  "📚", "🎂", "🍪", "🌻", "🎀", "🐶", "🍇", "🌎", "🍉", "🎤",
  "🎯", "🍋", "🎹", "🐾", "🪐", "🛴", "🦋", "🍫", "🐨", "🍒",
  "🌴", "🚲", "🎮", "⚡", "⭐", "🌟", "☕"
];

// 🟢 Chargement des émojis personnalisés
function loadEmojiList() {
  try {
    const storedEmojis = localStorage.getItem("emojiList");
    return storedEmojis ? JSON.parse(storedEmojis) : [...defaultEmojis];
  } catch (error) {
    console.error("Erreur lors du chargement des émojis :", error);
    return [...defaultEmojis];
  }
}

let emojiList = loadEmojiList(); // Déclaration avant utilisation

// 🟢 Sauvegarde des émojis dans `localStorage`
function saveEmojiList() {
  localStorage.setItem("emojiList", JSON.stringify(emojiList));
}

// 🟢 Génération sécurisée des cartes Dobble
function generateDobbleCards() {
  const n = 7; // Nombre de symboles par carte - 1
  const totalSymbols = n * n + n + 1;
  const symbols = emojiList.slice(0, totalSymbols);
  const cards = [];

  if (symbols.length < totalSymbols) {
    console.error("Pas assez de symboles pour générer toutes les cartes !");
    return [];
  }

  for (let i = 0; i <= n; i++) {
    const card = [symbols[0]];
    for (let j = 0; j < n; j++) {
      card.push(symbols[1 + i * n + j]);
    }
    cards.push(card);
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const card = [symbols[1 + i]];
      for (let k = 0; k < n; k++) {
        const index = 1 + n + k * n + ((i * k + j) % n);
        card.push(symbols[index]);
      }
      cards.push(card);
    }
  }

  return cards.slice(0, 55);
}

// 🟢 Génération et affichage des cartes
function generateCards() {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = "";

  const cards = generateDobbleCards();
  cards.forEach((card) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    positionSymbols(cardDiv, card);
    cardContainer.appendChild(cardDiv);
  });
}

// 🟢 Positionnement optimisé des symboles sur une carte
function positionSymbols(cardDiv, card) {
  const cardSize = 250;
  const margin = 20;
  const minSize = parseInt(document.getElementById("minSize").value, 10) || 30;
  const maxSize = parseInt(document.getElementById("maxSize").value, 10) || 70;
  const positions = [];

  card.forEach((symbol) => {
    let isValidPosition = false;
    let x, y, size;

    while (!isValidPosition) {
      size = Math.random() * (maxSize - minSize) + minSize;
      x = margin + Math.random() * (cardSize - 2 * margin - size);
      y = margin + Math.random() * (cardSize - 2 * margin - size);

      isValidPosition = positions.every(pos => {
        return Math.hypot(pos.x - x, pos.y - y) > (pos.size + size) / 2 + 10;
      });
    }

    positions.push({ x, y, size });

    // 🟢 Correction du bug : Vérifie si `symbol` est une image base64
    const symbolDiv = document.createElement("div");
    symbolDiv.className = "symbol";
    symbolDiv.style.position = "absolute";
    symbolDiv.style.left = `${x}px`;
    symbolDiv.style.top = `${y}px`;

    if (symbol.startsWith("data:image")) {
      const img = document.createElement("img");
      img.src = symbol;
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
      symbolDiv.appendChild(img);
    } else {
      symbolDiv.textContent = symbol;
      symbolDiv.style.fontSize = `${size}px`;
    }

    enableDrag(symbolDiv);
    cardDiv.appendChild(symbolDiv);
  });
}

// 🟢 Activation du glisser-déposer
function enableDrag(symbol) {
  let isDragging = false, offsetX, offsetY;

  symbol.addEventListener("mousedown", (event) => {
    isDragging = true;
    offsetX = event.clientX - symbol.offsetLeft;
    offsetY = event.clientY - symbol.offsetTop;
    symbol.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (event) => {
    if (isDragging) {
      symbol.style.left = `${event.clientX - offsetX}px`;
      symbol.style.top = `${event.clientY - offsetY}px`;
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    symbol.style.cursor = "move";
  });
}

// 🟢 Remplissage du tableau des émojis personnalisés
function populateEmojiTable() {
  const tableBody = document.getElementById("emojiTable").querySelector("tbody");
  tableBody.innerHTML = "";

  emojiList.forEach((emoji, index) => {
    const row = document.createElement("tr");

    // 📌 Cellule contenant l'emoji
    const emojiCell = document.createElement("td");
    emojiCell.id = `current-emoji-${index}`;

    // 🔥 Vérifie si c'est une image base64 ou un emoji standard
    if (emoji.startsWith("data:image")) {
      const img = document.createElement("img");
      img.src = emoji;
      img.width = 30;
      img.height = 30;
      emojiCell.appendChild(img);
    } else {
      emojiCell.textContent = emoji;
    }
    row.appendChild(emojiCell);

    // 📌 Cellule avec l'input pour changer l'image
    const inputCell = document.createElement("td");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.dataset.index = index;
    
    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          emojiList[index] = e.target.result;
          saveEmojiList();
          populateEmojiTable();  // Recharge correctement la table
          generateCards();  // Met à jour les cartes
        };
        reader.readAsDataURL(file);
      }
    });

    inputCell.appendChild(fileInput);
    row.appendChild(inputCell);

    tableBody.appendChild(row);
  });
}


// 🟢 Mise à jour des tailles min/max
function updatePreview() {
  const minSizeInput = document.getElementById("minSize");
  const maxSizeInput = document.getElementById("maxSize");

  if (+minSizeInput.value > +maxSizeInput.value) {
    maxSizeInput.value = minSizeInput.value;
  }
}

// 🟢 Initialisation
document.addEventListener("DOMContentLoaded", () => {
  populateEmojiTable();
  generateCards();
});

  // Empêche le comportement par défaut de drag & drop
  symbol.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  document.getElementById("minSize").addEventListener("input", () => {
    updatePreview();
    generateCards();
  });

  document.getElementById("maxSize").addEventListener("input", () => {
    updatePreview();
    generateCards();
  });
});

async function exportCardsAsZip() {
  const cardContainer = document.getElementById("cardContainer");
  const cards = cardContainer.querySelectorAll(".card");

  if (cards.length === 0) {
    alert("Aucune carte à exporter. Veuillez d'abord générer les cartes.");
    return;
  }

  const zip = new JSZip(); // Initialisation du fichier ZIP
  const folder = zip.folder("Cartes_Dobble"); // Création d'un dossier dans le ZIP

  for (let i = 0; i < cards.length; i++) {
    const canvas = await html2canvas(cards[i], { scale: 2 }); // Capture la carte en tant que canvas
    const imgData = canvas.toDataURL("image/png"); // Convertit en PNG

    // Ajoute l'image au dossier ZIP
    folder.file(carte_dobble_${i + 1}.png, imgData.split(",")[1], { base64: true });
  }

  // Génère le fichier ZIP
  zip.generateAsync({ type: "blob" }).then(function (content) {
    saveAs(content, "cartes_dobble.zip"); // Télécharge le fichier ZIP
    alert("Les 55 cartes ont été téléchargées en tant que fichier ZIP !");
  });
}
