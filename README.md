# Portfolio — Mathias ALY-BERIL

Portfolio personnel présentant mes projets académiques et personnels en informatique :
développement logiciel, cybersécurité, data, systèmes & réseaux et systèmes embarqués.

Site statique (HTML / CSS / JavaScript), sans dépendance ni build, destiné à être déployé
gratuitement avec **GitHub Pages**.

## Objectif

Donner à un recruteur une vue claire et honnête de mes compétences et de mes projets en moins
d'une minute, dans le cadre d'une recherche de stage, d'alternance ou de mobilité internationale.

## Technologies

- HTML5, CSS3 (variables, flexbox, grid, responsive)
- JavaScript (vanilla, sans framework)
- Polices Google Fonts (Inter, JetBrains Mono)

Aucune étape de compilation : il suffit d'ouvrir `index.html`.

## Structure

```text
portfolio-mathias/
├── index.html          # Page unique (hero, à propos, compétences, projets, parcours, CV, contact)
├── style.css           # Thème sombre, accent cyan/bleu, responsive
├── script.js           # Menu mobile, filtres projets, année dynamique
├── README.md
├── .nojekyll           # Sert les fichiers tels quels sur GitHub Pages
├── assets/
│   ├── images/         # Diagrammes UML (projet Distributeur Java)
│   ├── reports/        # Résultats / extraits techniques publiables
│   ├── notebooks/      # Notebook Jupyter (projet Data Mining)
│   └── cv/             # Emplacement du CV PDF (à ajouter)
└── projet/             # Dépôts de projets du cursus (voir note ci-dessous)
```

## Lancer en local

Ouvrir directement `index.html` dans un navigateur, ou servir le dossier :

```bash
# Python
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Déployer avec GitHub Pages

1. Pousser le dépôt sur GitHub (voir la note sur les dépôts imbriqués ci-dessous).
2. Sur GitHub : **Settings → Pages**.
3. **Source** : `Deploy from a branch`.
4. **Branch** : `main`, dossier `/ (root)`, puis **Save**.
5. Le site est publié sous quelques minutes à l'adresse
   `https://silverwolf974.github.io/portfolio-mathias/`.

Le fichier `.nojekyll` évite que GitHub Pages ignore certains fichiers via Jekyll.

## Note sur les dépôts Git imbriqués (`projet/`)

Le dossier `projet/` contient des projets du cursus qui sont **eux-mêmes des dépôts Git
indépendants** (chacun a son propre `.git`, hébergé sur le GitLab interne de l'école). Si on les
ajoute tels quels au dépôt du portfolio, Git les enregistre comme des références de sous-modules
« vides » : le code n'apparaît pas sur GitHub et le rendu est cassé.

**Solution recommandée (sans rien casser) :** ne pas versionner `projet/` dans le dépôt du
portfolio. Un fichier `.gitignore` est fourni à cet effet. Les projets restent intacts en local
et sur le GitLab de l'école ; le site, lui, reste propre et fonctionnel. Pour rendre du code
visible aux recruteurs, créer plus tard des dépôts publics dédiés sur GitHub et ajouter les liens
dans `index.html`.

## Confidentialité

Certains projets manipulent des environnements ou des rapports contenant des informations
internes (adresses IP locales, identifiants de laboratoire, journaux). Ces éléments **ne sont pas
publiés** sur le site : les rapports concernés sont indiqués comme « disponibles sur demande ».
Tout document ou capture ajouté au site doit d'abord être vérifié et, si nécessaire, anonymisé.

## Auteur

Mathias ALY-BERIL — étudiant ingénieur en informatique (ESIROI, Université de La Réunion).
Contact : alyderil.mathias@gmail.com · GitHub : https://github.com/Silverwolf974
