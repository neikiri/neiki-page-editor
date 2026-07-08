/**
 * Japanese translation map for Neiki's Page Editor.
 * Keys use flat dot-separated style compatible with Neiki's Editor.
 */
export const ja = {
  // Toolbar buttons
  'toolbar.viewCode': 'ソースを表示',
  'toolbar.undo': '元に戻す',
  'toolbar.redo': 'やり直す',
  'toolbar.findReplace': '検索と置換',
  'toolbar.bold': '太字',
  'toolbar.italic': '斜体',
  'toolbar.underline': '下線',
  'toolbar.strikethrough': '取り消し線',
  'toolbar.superscript': '上付き文字',
  'toolbar.subscript': '下付き文字',
  'toolbar.code': 'インラインコード',
  'toolbar.removeFormat': '書式をクリア',
  'toolbar.heading': '見出し',
  'toolbar.fontFamily': 'フォント',
  'toolbar.fontSize': 'フォントサイズ',
  'toolbar.foreColor': '文字色',
  'toolbar.backColor': '背景色',
  'toolbar.alignLeft': '左揃え',
  'toolbar.alignCenter': '中央揃え',
  'toolbar.alignRight': '右揃え',
  'toolbar.alignJustify': '両端揃え',
  'toolbar.indent': 'インデントを増やす',
  'toolbar.outdent': 'インデントを減らす',
  'toolbar.bulletList': '箇条書きリスト',
  'toolbar.numberedList': '番号付きリスト',
  'toolbar.blockquote': '引用',
  'toolbar.horizontalRule': '水平線',
  'toolbar.insertDropdown': '挿入',
  'toolbar.moreMenu': 'もっと見る',

  // Heading options
  'heading.paragraph': '段落',
  'heading.h1': '見出し 1',
  'heading.h2': '見出し 2',
  'heading.h3': '見出し 3',
  'heading.h4': '見出し 4',
  'heading.h5': '見出し 5',
  'heading.h6': '見出し 6',

  // Font families
  'fontFamily.sansSerif': 'ゴシック体',
  'fontFamily.serif': '明朝体',
  'fontFamily.monospace': '等幅フォント',
  'fontFamily.cursive': '筆記体',

  // Insert dropdown
  'insert.link': 'リンク',
  'insert.image': '画像',
  'insert.video': '動画',
  'insert.table': '表',
  'insert.emoji': '絵文字',
  'insert.specialChars': '特殊文字',

  // More menu
  'menu.more.save': '保存',
  'menu.more.preview': 'プレビュー',
  'menu.more.download': 'ダウンロード',
  'menu.more.print': '印刷',
  'menu.more.autosave': '自動保存',
  'menu.more.clearAll': 'すべて消去',
  'menu.more.changeTheme': 'テーマを変更',
  'menu.more.fullscreen': '全画面表示',
  'menu.more.help': 'ヘルプ',

  // Modals — common actions
  'modal.common.insert': '挿入',
  'modal.common.cancel': 'キャンセル',
  'modal.common.apply': '適用',
  'modal.common.close': '閉じる',

  // Modals — Link
  'modal.link.title': 'リンクを挿入',
  'modal.link.url': 'URL',
  'modal.link.text': '表示テキスト',
  'modal.link.newTab': '新しいタブで開く',
  'modal.link.insert': '挿入',
  'modal.link.cancel': 'キャンセル',

  // Modals — Image
  'modal.image.title': '画像を挿入',
  'modal.image.urlTab': 'URL',
  'modal.image.uploadTab': 'アップロード',
  'modal.image.tabUrl': 'URL',
  'modal.image.tabUpload': 'アップロード',
  'modal.image.url': '画像のURL',
  'modal.image.uploadLabel': '画像をアップロード',
  'modal.image.uploadHintHandler': '設定済みのハンドラー経由でアップロードされます',
  'modal.image.uploadHintBase64': 'base64に変換されます',
  'modal.image.alt': '代替テキスト',
  'modal.image.altPlaceholder': '画像の説明を入力',
  'modal.image.width': '幅（任意）',
  'modal.image.widthPlaceholder': '例：300px や 50%',
  'modal.image.or': 'または',
  'modal.image.invalidFile': '画像ファイル（PNG、JPEG、GIF、WebP、AVIF）のみ利用できます。',
  'modal.image.uploading': 'アップロード中…',
  'modal.image.upload': 'ファイルを選択またはドラッグ＆ドロップ',
  'modal.image.dropzone': 'ここに画像をドロップ、またはクリックして選択',
  'modal.image.insert': '挿入',
  'modal.image.cancel': 'キャンセル',

  // Modals — Video
  'modal.video.title': '動画を挿入',
  'modal.video.urlTab': 'URL',
  'modal.video.uploadTab': 'アップロード',
  'modal.video.tabUrl': 'URL',
  'modal.video.tabUpload': 'アップロード',
  'modal.video.url': '動画のURL',
  'modal.video.upload': 'ファイルを選択',
  'modal.video.insert': '挿入',
  'modal.video.cancel': 'キャンセル',

  // Modals — Table
  'modal.table.title': '表を挿入',
  'modal.table.rows': '行数',
  'modal.table.cols': '列数',
  'modal.table.columns': '列数',
  'modal.table.headerRow': 'ヘッダー行を含める',
  'modal.table.insert': '挿入',
  'modal.table.cancel': 'キャンセル',

  // Modals — Emoji / Special chars
  'modal.emoji.title': '絵文字を挿入',
  'modal.specialChars.title': '特殊文字',

  // Context menu — table
  'contextMenu.table.insertRowAbove': '上に行を挿入',
  'contextMenu.table.insertRowBelow': '下に行を挿入',
  'contextMenu.table.insertColLeft': '左に列を挿入',
  'contextMenu.table.insertColRight': '右に列を挿入',
  'contextMenu.table.deleteRow': '行を削除',
  'contextMenu.table.deleteCol': '列を削除',
  'contextMenu.table.deleteTable': '表を削除',
  'contextMenu.table.mergeCells': 'セルを結合',
  'contextMenu.table.splitCell': 'セルを分割',

  // Modals — Source View
  'modal.source.title': 'ソースを表示',
  'modal.source.html': 'HTML',
  'modal.source.css': 'CSS',
  'modal.source.apply': '適用',
  'modal.source.cancel': 'キャンセル',

  // Modals — Find & Replace
  'modal.findReplace.title': '検索と置換',
  'modal.findReplace.find': '検索',
  'modal.findReplace.replace': '置換後の文字列',
  'modal.findReplace.caseSensitive': '大文字と小文字を区別',
  'modal.findReplace.useRegex': '正規表現',
  'modal.findReplace.findNext': '次を検索',
  'modal.findReplace.replaceOne': '置換',
  'modal.findReplace.replaceAll': 'すべて置換',
  'modal.findReplace.close': '閉じる',

  // Color picker
  'color.apply': '適用',
  'color.reset': 'リセット',
  'color.hex': '16進数',

  // Status bar
  'statusbar.words': '単語数',
  'statusbar.characters': '文字数',
  'statusbar.block': 'ブロック',
  'statusbar.autosave': '自動保存',
  'statusbar.autosave.saved': '保存済み',
  'statusbar.autosave.saving': '保存中…',
  'statusbar.autosave.off': 'オフ',
  'statusbar.autosave.ago': '前',

  // Table context menu
  'table.insertRowAbove': '上に行を挿入',
  'table.insertRowBelow': '下に行を挿入',
  'table.insertColLeft': '左に列を挿入',
  'table.insertColRight': '右に列を挿入',
  'table.deleteRow': '行を削除',
  'table.deleteColumn': '列を削除',
  'table.deleteTable': '表を削除',
  'table.mergeCells': 'セルを結合',
  'table.splitCell': 'セルを分割',

  // Confirm messages
  'confirm.clearAll': 'すべての内容を消去してもよろしいですか？',

  // Error / status messages
  'error.saveFailed': '保存に失敗しました。変更内容は保持されています。',
  'error.loadFailed': 'コンテンツの読み込みに失敗しました。',
  'error.invalidUrl': '無効なURLです。',
  'error.uploadFailed': 'アップロードに失敗しました：{file}',
  'error.dataUrisDisabled': 'ファイルの埋め込みは無効になっています。URLを指定するか、アップロードハンドラーを設定してください。',
  'error.invalidStylesheetUrl': 'スタイルシートのURLが拒否されました：{url}',

  // Themes
  'theme.light': 'ライト',
  'theme.dark': 'ダーク',
  'theme.blue': 'ブルー',
  'theme.darkBlue': 'ダークブルー',
  'theme.midnight': 'ミッドナイト',
  'theme.void': 'ヴォイド',
  'theme.autumn': 'オータム',
  'theme.dracula': 'Dracula',

  // Help
  'help.title': 'ヘルプ',
  'help.close': '閉じる',
  'help.author': '作者',
  'help.version': 'バージョン',
  'help.github': 'GitHub',

  // Overlay — media resize / contextual toolbar
  'overlay.media.toolbar':    'メディアツールバー',
  'overlay.media.drag':       'ドラッグして位置を変更',
  'overlay.media.replace':    '置き換え',
  'overlay.media.delete':     '削除',

  // Floating toolbar
  'floatingToolbar.label':         '選択ツールバー',
  'floatingToolbar.link':          'リンクを挿入',
  'floatingToolbar.moveBlockUp':   'ブロックを上に移動',
  'floatingToolbar.moveBlockDown': 'ブロックを下に移動',
};

export default ja;
