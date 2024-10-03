module.exports = {
  '{apps,libs,tools,modules}/**/*.{ts,tsx}': (files) => {
    const filteredFiles = files.filter((file) => !file.includes('node_modules'))
    return `nx affected --target=type-check --files=${filteredFiles.join(',')}`
  },
  '{apps,libs,tools,modules}/**/*.{js,ts,jsx,tsx,json,css,scss}': [
    (files) => {
      const filteredFiles = files.filter(
        (file) => !file.includes('node_modules')
      )
      return `nx affected:lint --files=${filteredFiles.join(',')}`
    },
    (files) => {
      const filteredFiles = files.filter(
        (file) => !file.includes('node_modules')
      )
      return `nx format:write --files=${filteredFiles.join(',')}`
    },
  ],
}
