import nextra from 'nextra'

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: false,
  },
  // contentDirBasePath: '/docs',
  contentDirBasePath: '/',
})

export default withNextra({
  reactStrictMode: true,
  output: 'export',
})
