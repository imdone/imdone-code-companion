module.exports = function () {
  const project = this.project
  return [
    {
      title: 'Duplicate card',
      keys: ['shift+d'],
      action: (task) => {
        const timestamp = project.isoDateWithOffset
        project.newCard({
          list: project.config.getDefaultList(),
          path: task.relPath,
          template: task.content.replace(/(\screated:).*(\s)/, `$1${timestamp}$2`),
        })
        project.toast({ message: `"${task.text}" duplicated` })
      }
    },
    {
      title: 'Copy card to clipboard',
      keys: ['c'],
      action: (task) => {
        return project.copyToClipboard(task.content, `"${task.text} markdown" copied to clipboard`)
      },
    },
    {
      title: 'Copy card title to clipboard',
      keys: ['mod+t'],
      action: (task) => {
        const title = project.renderMarkdown(task.text).replaceAll(/<\/*p>/gi, '')
        return project.copyToClipboard(title, `"${title}" copied to clipboard`)
      },
    },
  ]
}
