# organisation et vocabulaire du programme

le programme est séparé en plusieurs parties :

* lib : fonctions namespaced non spécifique au programme
* model : fonctions et définitions d'objets spécififiques au programme
* out : fonctions de sortie, modèle de représentation
* in : fonctions de dispatch et traduction dans le vocabulaire modèle
* conf : partie de l'état supposé immutable après le démarrage du programme
* my : partie de l'état transformé par le programme

## lib

les types existants sont quand même nommés différemments pour éviter les
conflits à la con

* Any: fonctions de clonage, d'égalité
* Rec (Any) : record, fonctions d'objet
* Set (Any) : fonctions de liste

## model

* Ctn (Rec) : 3d container, fonction de rotation, de centre, les fonctions Mtx
  (width, height, depth), structures, voxels
* Struct (Rec) : 3d voxels structure, fonctions d'association
  voxel refs

TODO
