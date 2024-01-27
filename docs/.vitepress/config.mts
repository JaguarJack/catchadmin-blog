import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  //title: '博客',
  base: '/',
  //description: 'CatchAdmin 博客',
  assetsDir: 'blog/assets'
  //
  cleanUrls: true,
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/catch-admin/new-docs' }]
  }
})
