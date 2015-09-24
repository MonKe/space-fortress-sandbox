# avancée du boulot

## focus

* tiling optimisé
  + seules les tuiles visibles sont rendered
  * sprite réduite pour métal (-> ordre alphabétique sinon chiant)
  * fonction de calcul pour la sprite (simplement des alias ?)
  * covermask not working (& not updated with links) -> check render toutes les
    tuiles
- fonction de diff
- révision de l'ergonomie
  - toggle edit & view mode
  - mode shape par défaut, une commande pour changer de shape (tous les voxels
    sont dans une shape)
  - edit:shape est en alpha .5

## en détail 

+ d pour supprimer
+ panel d'info: le focus x, y, z et sa rotation
+ shift + flèches pour des rotations
  + fonction de rotation
  + bindings
  - éclairage orienté ?
* mode association
  + groupes sans modif
  + association effective
  + sélection de groupe
  + sélection / modification de groupes
  + rassemblement de groupes
    + refactoring des positions (pas trop le choix)
  + liens / jointures
    + visuels
    + css
    + update des liens à la rotation
    + update des liens au rassemblement de groupes
  + restreindre groupes aux neighbours seulement
  - séparation par delete : split de groupes  --  plus tard, ça va être galère !
+ refonte en canvas pour des questions de perf
  + récupérer le cssgen pour faire une fonction de tiling utilisée par render
  + recréer le focus (à l'identique pour l'instant)
* refonte générale : lisibilité et gain de perf
  + récupérer les associations, liens etc
  + rotation !!
  + split de fichiers pour plus de lisibilité
  - tiling en demi-blocs pour faciliter le diff
  - créer la fonction de diff
+ sélection du type de bloc
  + minimaliste
  + repeindre dur un bloc
* champ de vision
  + vue en coupe (à activer ou non)
  - visible prend en compte les cells superposées
* interface
  + panneau latéral d'outils
  - fenêtre de choix
  - save / load en webstorage
- mode "jeu"
  - collisions
  - commandes différentes (déplacement humain ?)
  - petit personnage
* un vaisseau : encore beaucoup de fonctionnalités qui manquent ?
  - un fond étoile (6 parois, une avec un soleil proche)
  - lumière directive (soleil proche)
  - material shop (fenêtre de sélection du matériau)
  - matériau : réacteur (objet)
  - matériau : vitre
  * matériau : bloc métal (extérieur tôle rivetée, intérieur structure métal)
  - matériau : panneau de contrôle
  - matériau : écran de contrôle
  - matériau : fauteuil de pilote (objet)
  - matériau : bloc porte
  - matériau : canon (objet)
  - fenêtre sélection de modèle (... ou nouveau)
  - sauver / charger
  - redimensionnement automatique
