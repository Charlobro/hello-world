# Statistiques Remorqueurs - Dashboard

Un site web moderne et interactif pour visualiser les statistiques et performances des remorqueurs en temps réel.

## 🚢 Fonctionnalités

### Dashboard Principal
- **Métriques clés** : Vue d'ensemble de la flotte avec cartes de synthèse
- **Interface responsive** : Optimisée pour desktop, tablette et mobile
- **Thème maritime** : Design professionnel avec couleurs inspirées de l'océan
- **Mode sombre/clair** : Basculement automatique avec préférences sauvegardées

### Visualisation des Données
- **Graphiques interactifs** : Utilisation de Chart.js pour des visualisations dynamiques
- **Graphique de performance** : Comparaison par remorqueur (efficacité, missions, heures)
- **Évolution mensuelle** : Suivi des heures d'opération sur 12 mois
- **Graphiques détaillés** : Charts individuels pour chaque remorqueur

### Fonctionnalités Avancées
- **Recherche en temps réel** : Filtrage instantané par nom de remorqueur
- **Filtres par statut** : Opérationnel, en maintenance, tous
- **Tri dynamique** : Classement par n'importe quelle colonne
- **Export de données** : Téléchargement des statistiques en JSON
- **Actualisation automatique** : Mise à jour des données en un clic

### Gestion des Remorqueurs
- **Détails complets** : Modal avec informations techniques détaillées
- **Historique de maintenance** : Suivi des dernières interventions
- **Alertes visuelles** : Indicateurs de statut colorés
- **Métriques individuelles** : Graphiques spécifiques à chaque remorqueur

## 📁 Structure du Projet

```
/
├── index.html              # Page principale du dashboard
├── css/
│   └── style.css          # Styles CSS avec thème maritime responsive
├── js/
│   ├── main.js           # Logique principale de l'application
│   └── charts.js         # Gestion des graphiques interactifs
├── data/
│   └── tugboat-stats.json # Données des remorqueurs (format JSON)
└── README.md              # Documentation du projet
```

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique moderne
- **CSS3** : Grid, Flexbox, Variables CSS, animations fluides
- **JavaScript ES6+** : Classes, async/await, modules
- **Chart.js** : Bibliothèque de graphiques interactifs
- **Font Awesome** : Icônes vectorielles
- **Design Responsive** : Mobile-first approach

## 📊 Format des Données

### Structure JSON
Le fichier `tugboat-stats.json` contient :

```json
{
  "tugboats": [
    {
      "id": 1,
      "name": "Neptune Force",
      "power_hp": 4500,
      "operation_hours": 2840,
      "missions_completed": 156,
      "fuel_consumption": 45.2,
      "efficiency": 92.5,
      "status": "operational",
      "last_maintenance": "2024-07-15",
      "crew_size": 6,
      "max_bollard_pull": 65,
      "year_built": 2019,
      "monthly_hours": [220, 235, 245, ...]
    }
  ],
  "fleet_summary": {
    "total_tugboats": 6,
    "operational": 5,
    "total_power_hp": 26100,
    "average_efficiency": 90.6
  },
  "performance_metrics": {
    "daily_avg_missions": 12.5,
    "utilization_rate": 78.5,
    "customer_satisfaction": 97.8
  }
}
```

## 🚀 Installation et Utilisation

### Prérequis
- Serveur web local (recommandé pour éviter les restrictions CORS)
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Démarrage Rapide

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Charlobro/hello-world.git
   cd hello-world
   ```

2. **Lancer un serveur local**
   ```bash
   # Avec Python
   python -m http.server 8000
   
   # Avec Node.js
   npx serve .
   
   # Avec PHP
   php -S localhost:8000
   ```

3. **Ouvrir dans le navigateur**
   Accéder à `http://localhost:8000`

### Utilisation

- **Navigation** : Utilisez les cartes de synthèse pour une vue d'ensemble
- **Recherche** : Tapez dans la barre de recherche pour filtrer les remorqueurs
- **Filtres** : Sélectionnez un statut pour filtrer par état opérationnel
- **Graphiques** : Changez les métriques affichées avec le sélecteur
- **Détails** : Cliquez sur l'icône œil pour voir les détails d'un remorqueur
- **Export** : Utilisez le bouton "Exporter" pour télécharger les données
- **Thème** : Basculez entre mode clair et sombre avec l'icône lune/soleil

## 🎨 Personnalisation

### Thèmes
Le système de thèmes utilise des variables CSS pour une personnalisation facile :

```css
:root {
  --primary-color: #1e40af;
  --ocean-blue: #0ea5e9;
  --lighthouse-yellow: #fbbf24;
  /* ... autres variables */
}
```

### Couleurs Maritime
- **Bleu océan** : Couleurs principales inspirées de la mer
- **Jaune phare** : Accents pour les éléments importants
- **Gris ancre** : Textes secondaires et bordures

### Responsive Design
- **Mobile First** : Optimisé pour les petits écrans
- **Breakpoints** : 480px, 768px, 1200px
- **Grilles flexibles** : Adaptation automatique du contenu

## 📈 Métriques Disponibles

### Synthèse de Flotte
- Nombre total de remorqueurs
- Remorqueurs opérationnels vs en maintenance
- Missions totales accomplies
- Heures d'opération cumulées
- Efficacité moyenne de la flotte

### Performance Individuelle
- Puissance en chevaux (HP)
- Missions accomplies
- Heures d'opération
- Efficacité (%)
- Consommation carburant (L/h)
- Force de traction maximale

### Indicateurs Avancés
- Taux d'utilisation
- Coût carburant mensuel
- Satisfaction client
- Incidents sécurité
- Conformité maintenance

## 🔧 Développement

### Structure du Code

**main.js** - Classe principale `TugboatDashboard` :
- Gestion des données et état de l'application
- Filtrage et recherche
- Interface utilisateur et interactions
- Thèmes et notifications

**charts.js** - Classe `ChartsManager` :
- Création et gestion des graphiques Chart.js
- Mise à jour dynamique des données
- Thèmes des graphiques
- Animations et interactions

### Fonctionnalités Clés

- **Chargement asynchrone** : Fetch API pour les données JSON
- **Filtrage temps réel** : Recherche et filtres instantanés
- **Tri multi-colonnes** : Classement ascendant/descendant
- **Modales dynamiques** : Détails contextuels des remorqueurs
- **Notifications** : Système de messages utilisateur
- **Export** : Génération de fichiers JSON

## 🌊 Design Maritime

Le design s'inspire de l'univers maritime avec :
- **Palette de couleurs** : Bleus océaniques, jaunes phare
- **Iconographie** : Font Awesome avec icônes navales
- **Animations** : Effets de vagues et transitions fluides
- **Typographie** : Police moderne et lisible
- **Espace** : Aération inspirée des horizons marins

## 📱 Compatibilité

- **Navigateurs** : Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Dispositifs** : Desktop, tablette, mobile
- **Résolutions** : 320px à 4K+
- **Accessibilité** : Support clavier, contrastes respectés

## 🚀 Performance

- **Chargement rapide** : CSS et JS optimisés
- **Images légères** : Icônes vectorielles SVG
- **Mise en cache** : Préférences utilisateur sauvegardées
- **Responsive** : Adaptation fluide sans rechargement

## 📄 Licence

Ce projet est développé pour demonstration des capacités de création de dashboards maritimes modernes.

## 🤝 Contribution

Pour contribuer au projet :
1. Fork du repository
2. Création d'une branche feature
3. Commit des modifications
4. Push vers la branche
5. Création d'une Pull Request

---

**Dernière mise à jour** : Août 2024  
**Version** : 1.0.0  
**Statut** : Production Ready 🚢
