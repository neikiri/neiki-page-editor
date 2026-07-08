/**
 * Simplified Chinese translation map for Neiki's Page Editor.
 * Keys use flat dot-separated style compatible with Neiki's Editor.
 */
export const zh = {
  // Toolbar buttons
  'toolbar.viewCode': '查看源代码',
  'toolbar.undo': '撤销',
  'toolbar.redo': '重做',
  'toolbar.findReplace': '查找和替换',
  'toolbar.bold': '粗体',
  'toolbar.italic': '斜体',
  'toolbar.underline': '下划线',
  'toolbar.strikethrough': '删除线',
  'toolbar.superscript': '上标',
  'toolbar.subscript': '下标',
  'toolbar.code': '行内代码',
  'toolbar.removeFormat': '清除格式',
  'toolbar.heading': '标题',
  'toolbar.fontFamily': '字体',
  'toolbar.fontSize': '字号',
  'toolbar.foreColor': '文字颜色',
  'toolbar.backColor': '背景颜色',
  'toolbar.alignLeft': '左对齐',
  'toolbar.alignCenter': '居中对齐',
  'toolbar.alignRight': '右对齐',
  'toolbar.alignJustify': '两端对齐',
  'toolbar.indent': '增加缩进',
  'toolbar.outdent': '减少缩进',
  'toolbar.bulletList': '项目符号列表',
  'toolbar.numberedList': '编号列表',
  'toolbar.blockquote': '引用',
  'toolbar.horizontalRule': '水平线',
  'toolbar.insertDropdown': '插入',
  'toolbar.moreMenu': '更多',

  // Heading options
  'heading.paragraph': '段落',
  'heading.h1': '标题 1',
  'heading.h2': '标题 2',
  'heading.h3': '标题 3',
  'heading.h4': '标题 4',
  'heading.h5': '标题 5',
  'heading.h6': '标题 6',

  // Font families
  'fontFamily.sansSerif': '无衬线体',
  'fontFamily.serif': '衬线体',
  'fontFamily.monospace': '等宽字体',
  'fontFamily.cursive': '手写体',

  // Insert dropdown
  'insert.link': '链接',
  'insert.image': '图片',
  'insert.video': '视频',
  'insert.table': '表格',
  'insert.emoji': '表情符号',
  'insert.specialChars': '特殊字符',

  // More menu
  'menu.more.save': '保存',
  'menu.more.preview': '预览',
  'menu.more.download': '下载',
  'menu.more.print': '打印',
  'menu.more.autosave': '自动保存',
  'menu.more.clearAll': '清空全部',
  'menu.more.changeTheme': '切换主题',
  'menu.more.fullscreen': '全屏',
  'menu.more.help': '帮助',

  // Modals — common actions
  'modal.common.insert': '插入',
  'modal.common.cancel': '取消',
  'modal.common.apply': '应用',
  'modal.common.close': '关闭',

  // Modals — Link
  'modal.link.title': '插入链接',
  'modal.link.url': '网址',
  'modal.link.text': '显示文字',
  'modal.link.newTab': '在新标签页中打开',
  'modal.link.insert': '插入',
  'modal.link.cancel': '取消',

  // Modals — Image
  'modal.image.title': '插入图片',
  'modal.image.urlTab': '网址',
  'modal.image.uploadTab': '上传',
  'modal.image.tabUrl': '网址',
  'modal.image.tabUpload': '上传',
  'modal.image.url': '图片网址',
  'modal.image.uploadLabel': '上传图片',
  'modal.image.uploadHintHandler': '将通过已配置的处理程序上传',
  'modal.image.uploadHintBase64': '将转换为 base64',
  'modal.image.alt': '替代文字',
  'modal.image.altPlaceholder': '描述这张图片',
  'modal.image.width': '宽度（可选）',
  'modal.image.widthPlaceholder': '例如 300px 或 50%',
  'modal.image.or': '或',
  'modal.image.invalidFile': '仅接受图片文件（PNG、JPEG、GIF、WebP、AVIF）。',
  'modal.image.uploading': '上传中…',
  'modal.image.upload': '选择文件或拖放到此处',
  'modal.image.dropzone': '将图片拖放到此处，或点击浏览',
  'modal.image.insert': '插入',
  'modal.image.cancel': '取消',

  // Modals — Video
  'modal.video.title': '插入视频',
  'modal.video.urlTab': '网址',
  'modal.video.uploadTab': '上传',
  'modal.video.tabUrl': '网址',
  'modal.video.tabUpload': '上传',
  'modal.video.url': '视频网址',
  'modal.video.upload': '选择文件',
  'modal.video.insert': '插入',
  'modal.video.cancel': '取消',

  // Modals — Table
  'modal.table.title': '插入表格',
  'modal.table.rows': '行数',
  'modal.table.cols': '列数',
  'modal.table.columns': '列数',
  'modal.table.headerRow': '包含表头行',
  'modal.table.insert': '插入',
  'modal.table.cancel': '取消',

  // Modals — Emoji / Special chars
  'modal.emoji.title': '插入表情符号',
  'modal.specialChars.title': '特殊字符',

  // Context menu — table
  'contextMenu.table.insertRowAbove': '在上方插入行',
  'contextMenu.table.insertRowBelow': '在下方插入行',
  'contextMenu.table.insertColLeft': '在左侧插入列',
  'contextMenu.table.insertColRight': '在右侧插入列',
  'contextMenu.table.deleteRow': '删除行',
  'contextMenu.table.deleteCol': '删除列',
  'contextMenu.table.deleteTable': '删除表格',
  'contextMenu.table.mergeCells': '合并单元格',
  'contextMenu.table.splitCell': '拆分单元格',

  // Modals — Source View
  'modal.source.title': '查看源代码',
  'modal.source.html': 'HTML',
  'modal.source.css': 'CSS',
  'modal.source.apply': '应用',
  'modal.source.cancel': '取消',

  // Modals — Find & Replace
  'modal.findReplace.title': '查找和替换',
  'modal.findReplace.find': '查找',
  'modal.findReplace.replace': '替换为',
  'modal.findReplace.caseSensitive': '区分大小写',
  'modal.findReplace.useRegex': '正则表达式',
  'modal.findReplace.findNext': '查找下一个',
  'modal.findReplace.replaceOne': '替换',
  'modal.findReplace.replaceAll': '全部替换',
  'modal.findReplace.close': '关闭',

  // Color picker
  'color.apply': '应用',
  'color.reset': '重置',
  'color.hex': '十六进制',

  // Status bar
  'statusbar.words': '字数',
  'statusbar.characters': '字符数',
  'statusbar.block': '区块',
  'statusbar.autosave': '自动保存',
  'statusbar.autosave.saved': '已保存',
  'statusbar.autosave.saving': '保存中…',
  'statusbar.autosave.off': '已关闭',
  'statusbar.autosave.ago': '前',

  // Table context menu
  'table.insertRowAbove': '在上方插入行',
  'table.insertRowBelow': '在下方插入行',
  'table.insertColLeft': '在左侧插入列',
  'table.insertColRight': '在右侧插入列',
  'table.deleteRow': '删除行',
  'table.deleteColumn': '删除列',
  'table.deleteTable': '删除表格',
  'table.mergeCells': '合并单元格',
  'table.splitCell': '拆分单元格',

  // Confirm messages
  'confirm.clearAll': '确定要清空全部内容吗？',

  // Error / status messages
  'error.saveFailed': '保存失败，您的更改已保留。',
  'error.loadFailed': '内容加载失败。',
  'error.invalidUrl': '网址无效。',
  'error.uploadFailed': '上传失败：{file}',
  'error.dataUrisDisabled': '文件内嵌功能已禁用，请提供网址或配置上传处理程序。',
  'error.invalidStylesheetUrl': '样式表网址被拒绝：{url}',

  // Themes
  'theme.light': '浅色',
  'theme.dark': '深色',
  'theme.blue': '蓝色',
  'theme.darkBlue': '深蓝色',
  'theme.midnight': '午夜',
  'theme.void': '虚空',
  'theme.autumn': '秋天',

  // Help
  'help.title': '帮助',
  'help.close': '关闭',
  'help.author': '作者',
  'help.version': '版本',
  'help.github': 'GitHub',

  // Overlay — media resize / contextual toolbar
  'overlay.media.toolbar':    '媒体工具栏',
  'overlay.media.drag':       '拖动以重新定位',
  'overlay.media.replace':    '替换',
  'overlay.media.delete':     '删除',

  // Floating toolbar
  'floatingToolbar.label':         '选区工具栏',
  'floatingToolbar.link':          '插入链接',
  'floatingToolbar.moveBlockUp':   '上移区块',
  'floatingToolbar.moveBlockDown': '下移区块',
};

export default zh;
