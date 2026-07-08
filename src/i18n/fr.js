/**
 * French translation map for Neiki's Page Editor.
 * Keys use flat dot-separated style compatible with Neiki's Editor.
 */
export const fr = {
  // Toolbar buttons
  'toolbar.viewCode': 'Voir le code source',
  'toolbar.undo': 'Annuler',
  'toolbar.redo': 'Rétablir',
  'toolbar.findReplace': 'Rechercher et remplacer',
  'toolbar.bold': 'Gras',
  'toolbar.italic': 'Italique',
  'toolbar.underline': 'Souligné',
  'toolbar.strikethrough': 'Barré',
  'toolbar.superscript': 'Exposant',
  'toolbar.subscript': 'Indice',
  'toolbar.code': 'Code en ligne',
  'toolbar.removeFormat': 'Supprimer la mise en forme',
  'toolbar.heading': 'Titre',
  'toolbar.fontFamily': 'Police',
  'toolbar.fontSize': 'Taille de police',
  'toolbar.foreColor': 'Couleur du texte',
  'toolbar.backColor': 'Couleur de fond',
  'toolbar.alignLeft': 'Aligner à gauche',
  'toolbar.alignCenter': 'Centrer',
  'toolbar.alignRight': 'Aligner à droite',
  'toolbar.alignJustify': 'Justifier',
  'toolbar.indent': 'Augmenter le retrait',
  'toolbar.outdent': 'Diminuer le retrait',
  'toolbar.bulletList': 'Liste à puces',
  'toolbar.numberedList': 'Liste numérotée',
  'toolbar.blockquote': 'Citation',
  'toolbar.horizontalRule': 'Ligne horizontale',
  'toolbar.insertDropdown': 'Insérer',
  'toolbar.moreMenu': 'Plus',

  // Heading options
  'heading.paragraph': 'Paragraphe',
  'heading.h1': 'Titre 1',
  'heading.h2': 'Titre 2',
  'heading.h3': 'Titre 3',
  'heading.h4': 'Titre 4',
  'heading.h5': 'Titre 5',
  'heading.h6': 'Titre 6',

  // Font families
  'fontFamily.sansSerif': 'Sans Serif',
  'fontFamily.serif': 'Serif',
  'fontFamily.monospace': 'Monospace',
  'fontFamily.cursive': 'Cursive',

  // Insert dropdown
  'insert.link': 'Lien',
  'insert.image': 'Image',
  'insert.video': 'Vidéo',
  'insert.table': 'Tableau',
  'insert.emoji': 'Emoji',
  'insert.specialChars': 'Caractères spéciaux',

  // More menu
  'menu.more.save': 'Enregistrer',
  'menu.more.preview': 'Aperçu',
  'menu.more.download': 'Télécharger',
  'menu.more.print': 'Imprimer',
  'menu.more.autosave': 'Enregistrement automatique',
  'menu.more.clearAll': 'Tout effacer',
  'menu.more.changeTheme': 'Changer de thème',
  'menu.more.fullscreen': 'Plein écran',
  'menu.more.help': 'Aide',

  // Modals — common actions
  'modal.common.insert': 'Insérer',
  'modal.common.cancel': 'Annuler',
  'modal.common.apply': 'Appliquer',
  'modal.common.close': 'Fermer',

  // Modals — Link
  'modal.link.title': 'Insérer un lien',
  'modal.link.url': 'URL',
  'modal.link.text': 'Texte affiché',
  'modal.link.newTab': 'Ouvrir dans un nouvel onglet',
  'modal.link.insert': 'Insérer',
  'modal.link.cancel': 'Annuler',

  // Modals — Image
  'modal.image.title': 'Insérer une image',
  'modal.image.urlTab': 'URL',
  'modal.image.uploadTab': 'Téléverser',
  'modal.image.tabUrl': 'URL',
  'modal.image.tabUpload': 'Téléverser',
  'modal.image.url': 'URL de l’image',
  'modal.image.uploadLabel': 'Téléverser une image',
  'modal.image.uploadHintHandler': 'Sera téléversée via le gestionnaire configuré',
  'modal.image.uploadHintBase64': 'Sera convertie en base64',
  'modal.image.alt': 'Texte alternatif',
  'modal.image.altPlaceholder': 'Décrivez l’image',
  'modal.image.width': 'Largeur (optionnel)',
  'modal.image.widthPlaceholder': 'ex. 300px ou 50%',
  'modal.image.or': 'OU',
  'modal.image.invalidFile': 'Seuls les fichiers image (PNG, JPEG, GIF, WebP, AVIF) sont acceptés.',
  'modal.image.uploading': 'Téléversement…',
  'modal.image.upload': 'Choisissez des fichiers ou glissez-déposez',
  'modal.image.dropzone': 'Déposez les images ici ou cliquez pour parcourir',
  'modal.image.insert': 'Insérer',
  'modal.image.cancel': 'Annuler',

  // Modals — Video
  'modal.video.title': 'Insérer une vidéo',
  'modal.video.urlTab': 'URL',
  'modal.video.uploadTab': 'Téléverser',
  'modal.video.tabUrl': 'URL',
  'modal.video.tabUpload': 'Téléverser',
  'modal.video.url': 'URL de la vidéo',
  'modal.video.upload': 'Choisir un fichier',
  'modal.video.insert': 'Insérer',
  'modal.video.cancel': 'Annuler',

  // Modals — Table
  'modal.table.title': 'Insérer un tableau',
  'modal.table.rows': 'Lignes',
  'modal.table.cols': 'Colonnes',
  'modal.table.columns': 'Colonnes',
  'modal.table.headerRow': 'Inclure une ligne d’en-tête',
  'modal.table.insert': 'Insérer',
  'modal.table.cancel': 'Annuler',

  // Modals — Emoji / Special chars
  'modal.emoji.title': 'Insérer un emoji',
  'modal.specialChars.title': 'Caractères spéciaux',

  // Context menu — table
  'contextMenu.table.insertRowAbove': 'Insérer une ligne au-dessus',
  'contextMenu.table.insertRowBelow': 'Insérer une ligne en dessous',
  'contextMenu.table.insertColLeft': 'Insérer une colonne à gauche',
  'contextMenu.table.insertColRight': 'Insérer une colonne à droite',
  'contextMenu.table.deleteRow': 'Supprimer la ligne',
  'contextMenu.table.deleteCol': 'Supprimer la colonne',
  'contextMenu.table.deleteTable': 'Supprimer le tableau',
  'contextMenu.table.mergeCells': 'Fusionner les cellules',
  'contextMenu.table.splitCell': 'Diviser la cellule',

  // Modals — Source View
  'modal.source.title': 'Voir le code source',
  'modal.source.html': 'HTML',
  'modal.source.css': 'CSS',
  'modal.source.apply': 'Appliquer',
  'modal.source.cancel': 'Annuler',

  // Modals — Find & Replace
  'modal.findReplace.title': 'Rechercher et remplacer',
  'modal.findReplace.find': 'Rechercher',
  'modal.findReplace.replace': 'Remplacer par',
  'modal.findReplace.caseSensitive': 'Respecter la casse',
  'modal.findReplace.useRegex': 'Expression régulière',
  'modal.findReplace.findNext': 'Suivant',
  'modal.findReplace.replaceOne': 'Remplacer',
  'modal.findReplace.replaceAll': 'Tout remplacer',
  'modal.findReplace.close': 'Fermer',

  // Color picker
  'color.apply': 'Appliquer',
  'color.reset': 'Réinitialiser',
  'color.hex': 'Hex',

  // Status bar
  'statusbar.words': 'Mots',
  'statusbar.characters': 'Caractères',
  'statusbar.block': 'Bloc',
  'statusbar.autosave': 'Enregistrement automatique',
  'statusbar.autosave.saved': 'Enregistré',
  'statusbar.autosave.saving': 'Enregistrement…',
  'statusbar.autosave.off': 'Désactivé',
  'statusbar.autosave.ago': 'il y a',

  // Table context menu
  'table.insertRowAbove': 'Insérer une ligne au-dessus',
  'table.insertRowBelow': 'Insérer une ligne en dessous',
  'table.insertColLeft': 'Insérer une colonne à gauche',
  'table.insertColRight': 'Insérer une colonne à droite',
  'table.deleteRow': 'Supprimer la ligne',
  'table.deleteColumn': 'Supprimer la colonne',
  'table.deleteTable': 'Supprimer le tableau',
  'table.mergeCells': 'Fusionner les cellules',
  'table.splitCell': 'Diviser la cellule',

  // Confirm messages
  'confirm.clearAll': 'Voulez-vous vraiment effacer tout le contenu ?',

  // Error / status messages
  'error.saveFailed': 'Échec de l’enregistrement. Vos modifications sont conservées.',
  'error.loadFailed': 'Échec du chargement du contenu.',
  'error.invalidUrl': 'URL invalide.',
  'error.uploadFailed': 'Échec du téléversement : {file}',
  'error.dataUrisDisabled': 'L’intégration de fichiers est désactivée. Veuillez fournir une URL ou configurer un gestionnaire de téléversement.',
  'error.invalidStylesheetUrl': 'URL de feuille de style rejetée : {url}',

  // Themes
  'theme.light': 'Clair',
  'theme.dark': 'Sombre',
  'theme.blue': 'Bleu',
  'theme.darkBlue': 'Bleu foncé',
  'theme.midnight': 'Minuit',
  'theme.void': 'Vide',
  'theme.autumn': 'Automne',
  'theme.dracula': 'Dracula',

  // Help
  'help.title': 'Aide',
  'help.close': 'Fermer',
  'help.author': 'Auteur',
  'help.version': 'Version',
  'help.github': 'GitHub',

  // Overlay — media resize / contextual toolbar
  'overlay.media.toolbar':    'Barre d’outils multimédia',
  'overlay.media.drag':       'Faites glisser pour repositionner',
  'overlay.media.replace':    'Remplacer',
  'overlay.media.delete':     'Supprimer',

  // Floating toolbar
  'floatingToolbar.label':         'Barre d’outils de sélection',
  'floatingToolbar.link':          'Insérer un lien',
  'floatingToolbar.moveBlockUp':   'Déplacer le bloc vers le haut',
  'floatingToolbar.moveBlockDown': 'Déplacer le bloc vers le bas',
};

export default fr;
